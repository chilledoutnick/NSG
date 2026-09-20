from django.core.exceptions import ValidationError
from django.db import models
from api.models.User import User
class Tag(models.Model):
    DEFAULT_TAGS = [
        ("Business Card", "#E0E8F4", "Exchange Contact", ""),
        ("Manually Added", "#E0E8F4", "Manual Addition", ""),
        ("Prospect", "#F4EEE0", "A potential customer you're actively targeting.", "NSG suggests to keep close follow up with prospects by using reminder, mail & other means of communication to not lose a great business opportunity."),
        ("Client", "#EEFDE2", "Someone already using your services or products.", "NSG suggests that you make efforts to retain clients with the best possible conduct and induce a sense of empowerment."),
        ("Potential Partner", "#EEECFF", "A person or company with mutual interest in collaboration.", "NSG suggests nurturing this relationship by exploring joint ventures, exchanging expertise, and fostering open communication for long-term success."),
        ("Advisor/Mentor", "#FFEFEA", "Someone offering guidance and valuable insights to support your growth.", "NSG suggests maintaining regular contact, seeking advice on key decisions, and showing appreciation for their expertise to strengthen this meaningful relationship."),
        ("Team Member", "#FFEFEA", "A Client is an individual or an organisation who has become more than a prospect by accepting your service offerings.", "NSG suggests that you make efforts to retain clients with the best possible conduct and induce a sense of empowerment."),
        ("Business Partner", "#FFEFEA", "A person or company with mutual interest in collaboration.", "NSG suggests nurturing this relationship by exploring joint ventures, exchanging expertise, and fostering open communication for long-term success."),
        ("Added from Scheduler", "#00740e", "A person or company added from the scheduler.", "NSG suggests nurturing this relationship by exploring joint ventures, exchanging expertise, and fostering open communication for long-term success."),
        ("Email", "#D1E8FF", "Added via email sync", ""),
        ("Meeting", "#FFE4D1", "Added via calendar meeting", ""),
    ]

    name = models.CharField(max_length=255)
    fk_user = models.ForeignKey("User", null=True, blank=True, on_delete=models.CASCADE)  # Null means it's a default tag
    color = models.CharField(max_length=7)  # Store hex color code
    info_title = models.TextField(null=True, blank=True)  # Only relevant for default tags
    info_desc = models.TextField(null=True, blank=True)  # Only relevant for default tags
    is_default = models.BooleanField(default=False)

    class Meta:
        unique_together = ('fk_user', 'name')

    def save(self, *args, **kwargs):
        # Ensure default tags are not modified
        if self.is_default and Tag.objects.filter(name=self.name).exists():
            raise ValidationError("Default tags cannot be modified.")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @classmethod
    def create_default_tags(cls):
        for tag_name, tag_color, info in cls.DEFAULT_TAGS:
            if not cls.objects.filter(name=tag_name).exists():
                cls.objects.create(name=tag_name, color=tag_color, info=info, is_default=True)
                print(f"Created tag: {cls.DEFAULT_TAGS}")
