SET local check_function_bodies = off;

CREATE TABLE "public"."tracking_events" (
  "id"          bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "tracking_id" uuid                     NOT NULL,
  "occurred_at" timestamp with time zone NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT "tracking_events_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."tracking_events"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."tracking_events" FROM "anon";

CREATE TABLE "public"."trackings" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "owner_id"        uuid                     NOT NULL,
  "recipient_email" text                     NOT NULL,
  "token"           text                     NOT NULL DEFAULT rtrim(translate(encode(extensions.gen_random_bytes(32), 'base64'::text), '+/'::text, '-_'::text), '='::text),
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "trackings_pkey" PRIMARY KEY (id),
  CONSTRAINT "trackings_recipient_email_check"
    CHECK ((((char_length(recipient_email) >= 5) AND (char_length(recipient_email) <= 254)) AND (recipient_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'::text))),
  CONSTRAINT "trackings_token_check" CHECK ((token ~ '^[A-Za-z0-9_-]{43}$'::text)),
  CONSTRAINT "trackings_token_key" UNIQUE (token)
);

ALTER TABLE "public"."trackings"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."trackings" FROM "anon";

CREATE OR REPLACE FUNCTION public.record_tracking_event (
  p_token text
)
  RETURNS boolean
  LANGUAGE sql
  SET search_path TO ''
  AS $function$
  with inserted as (
    insert into public.tracking_events(tracking_id)
    select id from public.trackings where token = p_token
    returning id
  ) select exists(select 1 from inserted);
$function$;

REVOKE ALL ON FUNCTION "public"."record_tracking_event"(text) FROM PUBLIC, "anon", "authenticated";

ALTER TABLE "public"."trackings"
  ADD CONSTRAINT "trackings_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."tracking_events"
  ADD CONSTRAINT "tracking_events_tracking_id_fkey" FOREIGN KEY (tracking_id) REFERENCES public.trackings(id) ON DELETE CASCADE;

CREATE VIEW "public"."tracking_summaries" WITH (security_invoker=true) AS  SELECT t.id,
    t.owner_id,
    t.recipient_email,
    t.token,
    t.created_at,
    e.signal_count,
    e.first_signal,
    e.last_signal
   FROM (public.trackings t
     CROSS JOIN LATERAL ( SELECT count(*) AS signal_count,
            min(tracking_events.occurred_at) AS first_signal,
            max(tracking_events.occurred_at) AS last_signal
           FROM public.tracking_events
          WHERE (tracking_events.tracking_id = t.id)) e);

REVOKE ALL ON TABLE "public"."tracking_summaries" FROM "anon", "service_role";

CREATE INDEX tracking_events_tracking_time_idx ON public.tracking_events USING btree (tracking_id, occurred_at);

CREATE INDEX trackings_owner_created_idx ON public.trackings USING btree (owner_id, created_at DESC, id DESC);

CREATE POLICY "event_read_own" ON "public"."tracking_events"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.trackings t
  WHERE ((t.id = tracking_events.tracking_id) AND (t.owner_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "tracking_create_own" ON "public"."trackings"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = owner_id));

CREATE POLICY "tracking_delete_own" ON "public"."trackings"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = owner_id));

CREATE POLICY "tracking_read_own" ON "public"."trackings"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = owner_id));

REVOKE ALL ON FUNCTION "public"."record_tracking_event"(text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."record_tracking_event"(text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."record_tracking_event"(text) TO "service_role";

REVOKE ALL ON SEQUENCE "public"."tracking_events_id_seq" FROM "anon";

GRANT UPDATE ON SEQUENCE "public"."tracking_events_id_seq" TO "anon";

REVOKE ALL ON SEQUENCE "public"."tracking_events_id_seq" FROM "authenticated";

GRANT UPDATE ON SEQUENCE "public"."tracking_events_id_seq" TO "authenticated";

REVOKE ALL ON SEQUENCE "public"."tracking_events_id_seq" FROM "postgres";

GRANT SELECT, UPDATE, USAGE ON SEQUENCE "public"."tracking_events_id_seq" TO "postgres";

REVOKE ALL ON SEQUENCE "public"."tracking_events_id_seq" FROM "service_role";

GRANT UPDATE, USAGE ON SEQUENCE "public"."tracking_events_id_seq" TO "service_role";

REVOKE ALL ON TABLE "public"."tracking_events" FROM "authenticated";

GRANT SELECT ON TABLE "public"."tracking_events" TO "authenticated";

REVOKE ALL ON TABLE "public"."tracking_events" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tracking_events" TO "postgres";

REVOKE ALL ON TABLE "public"."tracking_events" FROM "service_role";

GRANT INSERT, SELECT ON TABLE "public"."tracking_events" TO "service_role";

REVOKE ALL ON TABLE "public"."trackings" FROM "authenticated";

REVOKE ALL ("owner_id") ON TABLE "public"."trackings" FROM "authenticated";

GRANT INSERT ("owner_id") ON TABLE "public"."trackings" TO "authenticated";

REVOKE ALL ("recipient_email") ON TABLE "public"."trackings" FROM "authenticated";

GRANT INSERT ("recipient_email") ON TABLE "public"."trackings" TO "authenticated";

GRANT DELETE, SELECT ON TABLE "public"."trackings" TO "authenticated";

REVOKE ALL ON TABLE "public"."trackings" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."trackings" TO "postgres";

REVOKE ALL ON TABLE "public"."trackings" FROM "service_role";

GRANT SELECT ON TABLE "public"."trackings" TO "service_role";

REVOKE ALL ON TABLE "public"."tracking_summaries" FROM "authenticated";

GRANT SELECT ON TABLE "public"."tracking_summaries" TO "authenticated";

REVOKE ALL ON TABLE "public"."tracking_summaries" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tracking_summaries" TO "postgres";


-- Remove inherited sequence defaults; only the recorder may allocate event IDs.
revoke all on sequence public.tracking_events_id_seq from public, anon, authenticated, service_role;
grant usage on sequence public.tracking_events_id_seq to service_role;
