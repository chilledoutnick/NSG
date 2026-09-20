from django.core.management.base import BaseCommand
from api.models import *



class Command(BaseCommand):
    help = "Migrate fk_advisor_id into fk_user_id"

    def handle(self, *args, **kwargs):

        # Fetch all appointments
        appointments = Appointment.objects.all()

        if not appointments.exists():
            self.stdout.write(self.style.WARNING('No appointments found.'))
            return

        # Iterate over all advisor appointments and update their data
        for apt in appointments:
            # Ensure the advisor exists before trying to access fk_user_id
            if apt.fk_client:
                try:
                    advisor = AdvisorAppointment.objects.filter(fk_appointment=apt).first()
                    contact = Contact.objects.get(fk_client_id=apt.fk_client_id, owner_id=advisor.fk_user_id)
                    apt.fk_contact_id = contact.id
                    apt.save()  # Save the updated appointment
                    self.stdout.write(self.style.SUCCESS(f"Successfully migrated data for appointments {apt.appointment_id}"))
                except Contact.DoesNotExist:
                        self.stdout.write(self.style.WARNING(f"No Contact found for client {apt.fk_client_id}."))
            else:
                self.stdout.write(self.style.WARNING(f"Advisor not found for appointments {apt.appointment_id}"))

        # Fetch all advisor reviews
        reviews = Review.objects.all()

        if not reviews.exists():
            self.stdout.write(self.style.WARNING('No advisor reviews found.'))
            return

        # Iterate over all advisor appointments and update their data
        for review in reviews:
            # Ensure the advisor exists before trying to access fk_user_id
            if review.fk_advisor:
                review.fk_user_id = review.fk_advisor.fk_user_id
            if review.fk_client:
                try:
                    contacts = Contact.objects.filter(fk_client_id=review.fk_client_id)
                    # Assign the found contact ID to review.fk_contact_id
                    if contacts:
                        for contact in contacts:
                            review.fk_contact_id = contact.id
                except Contact.DoesNotExist:
                        self.stdout.write(self.style.WARNING(f"No Contact found for client {review.fk_client_id}."))
            review.save()  # Save the updated appointment
            self.stdout.write(self.style.SUCCESS(f"Successfully migrated data for reviews {review.review_id}"))



        self.stdout.write(self.style.SUCCESS('Data migration completed.'))
