from django.db import models
from api.models.Services import contact_upload_path
from api.models.User import User
import uuid
from django.utils.text import slugify

class Contact(models.Model):
    source_type = models.CharField(max_length=50, choices=[
        ('manual', 'Manually added'),
        ('business_card', 'Business card'),
        ('qr_code', 'QR code'),
        ('link_share', 'Link share'),
    ])

    public_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True
    )

    slug = models.SlugField(max_length=255, blank=True)

    user_profile = models.ForeignKey("User", null=True, blank=True, on_delete=models.SET_NULL) # When contact is tied to a user
    is_user = models.BooleanField(default=False)  # Distinguish if the contact is also a user
    owner = models.ForeignKey("User", on_delete=models.CASCADE, related_name='contacts') # The user who owns this contact
    name = models.CharField(max_length=255)
    profile_pic = models.URLField(max_length=2048, null=True, blank=True)  # Stored in GCP
    email = models.EmailField(null=True, blank=True)
    additional_email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    additional_phone = models.CharField(max_length=20, null=True, blank=True)
    birthday = models.DateField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    designation = models.CharField(max_length=255, null=True, blank=True)  # Work designation or company
    company = models.CharField(max_length=255, null=True, blank=True)  # Work designation or company
    date_added = models.DateTimeField(auto_now_add=True)  # Automatically sets when contact is added
    priority = models.CharField(max_length=10, choices=[('High', 'High'), ('Medium', 'Medium'), ('Low', 'Low')], default='Low')
    social_links = models.JSONField(null=True, blank=True)  # To store multiple social media profiles
    image = models.ImageField(upload_to=contact_upload_path)
    is_profile_pic = models.BooleanField(default=False)  # Option to set one as profile pic
    uploaded_at = models.DateTimeField(auto_now_add=True)
    source_details = models.TextField(null=True, blank=True)  # Optional additional details
    is_archived = models.BooleanField(default=False)
    updated_at = models.DateTimeField(null=True, blank=True)
    pfp_color = models.TextField(null=True, blank=True)  # profile pic color
    generated_text = models.TextField(null=True, blank=True)
    last_reengagement_sent_at = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True
    )
    source = models.CharField(max_length=50)  # gmail / outlook / manual / card
    external_id = models.CharField(max_length=255, null=True, blank=True)

    created_from = models.CharField(max_length=50)  # email / meeting / import


    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['email', 'owner'], name='unique_contact_per_user')
        ]

    def archive(self):
        self.is_archived = True
        self.save()

    def unarchived(self):
        self.is_archived = False
        self.save()

    # models.py
    def get_absolute_url(self):
        return f"/contact/{self.public_id}-{self.slug}"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1

            while Contact.objects.filter(
                    slug=slug,
                    owner=self.owner
            ).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ContactShare(models.Model):
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    contact = models.ForeignKey("Contact", on_delete=models.CASCADE)
    shared_by = models.ForeignKey("User", on_delete=models.CASCADE)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
