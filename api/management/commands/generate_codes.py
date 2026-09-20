import csv
import secrets
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from api.models.EmailOTP import RedemptionCode


# Replace 'accounts' with your actual app name if it differs


class Command(BaseCommand):
    help = "Generates unique DealMirror redemption codes and exports them to a CSV file."

    def add_arguments(self, parser):
        # Optional argument for the number of codes (default: 500)
        parser.add_argument(
            '--count',
            type=int,
            default=500,
            help='Number of redemption codes to generate'
        )
        # Optional argument for the code prefix (default: LC-)
        parser.add_argument(
            '--prefix',
            type=str,
            default='LC-',
            help='Prefix for the redemption codes'
        )
        # Optional argument to name the output CSV file
        parser.add_argument(
            '--output',
            type=str,
            default='dealmirror_codes.csv',
            help='Output CSV filename'
        )

    def handle(self, *args, **options):
        count = options['count']
        prefix = options['prefix']
        output_file = options['output']

        allowed_chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        generated_codes = []

        self.stdout.write(f"Generating {count} unique codes with prefix '{prefix}'...")

        # 1. Generate and save codes to the Database
        while len(generated_codes) < count:
            random_suffix = ''.join(secrets.choice(allowed_chars) for _ in range(8))
            full_code = f"{prefix}{random_suffix}"

            # Ensure global uniqueness in the DB
            if not RedemptionCode.objects.filter(code=full_code).exists():
                # Adjusted to match standard model structure
                RedemptionCode.objects.create(code=full_code)
                generated_codes.append(full_code)

        self.stdout.write(self.style.SUCCESS(f"Successfully saved {count} codes to the database."))

        # 2. Export the newly generated codes to a CSV
        try:
            with open(output_file, mode='w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                # Write the header row
                writer.writerow(['Redemption Code'])

                # Write the codes
                for code in generated_codes:
                    writer.writerow([code])

            self.stdout.write(self.style.SUCCESS(f"Successfully exported codes to '{output_file}'"))

        except IOError as e:
            raise CommandError(f"Failed to write CSV file: {e}")