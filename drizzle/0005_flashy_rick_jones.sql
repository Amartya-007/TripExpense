CREATE TYPE "public"."expense_category" AS ENUM('food', 'transport', 'stay', 'ticket', 'other');--> statement-breakpoint
CREATE TABLE "expense" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"title" text NOT NULL,
	"amount" integer NOT NULL,
	"category" "expense_category" NOT NULL,
	"paid_by_participant_id" text NOT NULL,
	"date_time" timestamp NOT NULL,
	"note" text,
	"receipt_url" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "expense_split" (
	"id" text PRIMARY KEY NOT NULL,
	"expense_id" text NOT NULL,
	"participant_id" text NOT NULL,
	"share_amount" integer NOT NULL,
	CONSTRAINT "expense_split_expense_participant_unique" UNIQUE("expense_id","participant_id")
);
--> statement-breakpoint
CREATE TABLE "settlement" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"from_participant_id" text NOT NULL,
	"to_participant_id" text NOT NULL,
	"amount" integer NOT NULL,
	"settled_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"budget" integer,
	"start_date" timestamp,
	"end_date" timestamp,
	"cover_image_url" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "trip_participant" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"user_id" text,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "trip_participant_trip_user_unique" UNIQUE("trip_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_paid_by_participant_id_trip_participant_id_fk" FOREIGN KEY ("paid_by_participant_id") REFERENCES "public"."trip_participant"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_split" ADD CONSTRAINT "expense_split_expense_id_expense_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expense"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_split" ADD CONSTRAINT "expense_split_participant_id_trip_participant_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."trip_participant"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlement" ADD CONSTRAINT "settlement_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlement" ADD CONSTRAINT "settlement_from_participant_id_trip_participant_id_fk" FOREIGN KEY ("from_participant_id") REFERENCES "public"."trip_participant"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlement" ADD CONSTRAINT "settlement_to_participant_id_trip_participant_id_fk" FOREIGN KEY ("to_participant_id") REFERENCES "public"."trip_participant"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlement" ADD CONSTRAINT "settlement_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_participant" ADD CONSTRAINT "trip_participant_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_participant" ADD CONSTRAINT "trip_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expense_tripId_idx" ON "expense" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "expense_paidByParticipantId_idx" ON "expense" USING btree ("paid_by_participant_id");--> statement-breakpoint
CREATE INDEX "expense_split_expenseId_idx" ON "expense_split" USING btree ("expense_id");--> statement-breakpoint
CREATE INDEX "settlement_tripId_idx" ON "settlement" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_createdBy_idx" ON "trip" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "trip_participant_tripId_idx" ON "trip_participant" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_participant_userId_idx" ON "trip_participant" USING btree ("user_id");