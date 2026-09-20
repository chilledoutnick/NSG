from django.db import models

class NSGSmartCard(models.Model):
    fk_user = models.ForeignKey('User', on_delete=models.CASCADE) 
    has_smart_card = models.BooleanField(default=False)

    class Meta:
        db_table = "api_smartcard"

# Aliases for backward compatibility and clean naming
SmartCard = NSGSmartCard
LeaponSmartCard = NSGSmartCard