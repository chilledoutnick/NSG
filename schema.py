# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AccountEmailaddress(models.Model):
    email = models.CharField(max_length=254)
    verified = models.IntegerField()
    primary = models.IntegerField()
    user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'account_emailaddress'
        unique_together = (('user', 'email'),)


class AccountEmailconfirmation(models.Model):
    created = models.DateTimeField()
    sent = models.DateTimeField(blank=True, null=True)
    key = models.CharField(unique=True, max_length=64)
    email_address = models.ForeignKey(AccountEmailaddress, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'account_emailconfirmation'


class ApiAdminadvisor(models.Model):
    id = models.BigAutoField(primary_key=True)
    code = models.CharField(unique=True, max_length=20)
    logo = models.CharField(max_length=100, blank=True, null=True)
    color = models.CharField(max_length=20)
    team_limit = models.IntegerField()
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_adminadvisor'


class ApiAdvisorappointment(models.Model):
    advisor_appointment_id = models.AutoField(primary_key=True)
    timestamp = models.DateField()
    status = models.CharField(max_length=10)
    fk_appointment = models.ForeignKey('ApiAppointment', models.DO_NOTHING)
    owner = models.IntegerField()
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_advisorappointment'
        unique_together = (('fk_appointment', 'fk_advisor'), ('fk_appointment', 'fk_user'),)


class ApiAdvisorgallery(models.Model):
    gallery_id = models.AutoField(primary_key=True)
    timestamp = models.DateField()
    status = models.CharField(max_length=10)
    pictures = models.CharField(max_length=100)
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_advisorgallery'


class ApiAdvisorlogo(models.Model):
    id = models.BigAutoField(primary_key=True)
    logo = models.CharField(unique=True, max_length=100)
    timestamp = models.DateTimeField()
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_advisorlogo'


class ApiAdvisorprofilelogo(models.Model):
    id = models.BigAutoField(primary_key=True)
    logo = models.CharField(unique=True, max_length=100)
    timestamp = models.DateTimeField()
    fk_profile = models.ForeignKey('ApiProfiles', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_advisorprofilelogo'


class ApiAdvisorslottime(models.Model):
    id = models.BigAutoField(primary_key=True)
    slot_time = models.JSONField(blank=True, null=True)
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_advisorslottime'


class ApiAgent(models.Model):
    id = models.BigAutoField(primary_key=True)
    info = models.CharField(max_length=1024)
    agent_id = models.CharField(max_length=512)
    secret_key = models.CharField(max_length=1024)
    fk_user_id = models.BigIntegerField(blank=True, null=True)
    owner = models.CharField(max_length=1024)
    agent_username = models.CharField(max_length=512)
    created_at = models.DateTimeField()
    language = models.CharField(max_length=20)
    prompt = models.TextField()
    twilio_number = models.CharField(max_length=20, blank=True, null=True)
    voice_id = models.CharField(max_length=100)
    client_name = models.CharField(max_length=512)

    class Meta:
        managed = False
        db_table = 'api_agent'


class ApiApplepass(models.Model):
    id = models.BigAutoField(primary_key=True)
    applepass = models.CharField(unique=True, max_length=100)
    timestamp = models.DateTimeField()
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)
    username = models.CharField(max_length=120)

    class Meta:
        managed = False
        db_table = 'api_applepass'
        unique_together = (('fk_user', 'username'),)


class ApiAppointment(models.Model):
    appointment_id = models.AutoField(primary_key=True)
    create_date = models.DateField()
    create_time = models.TimeField()
    update_date = models.DateField()
    update_time = models.TimeField()
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=10)
    duration = models.IntegerField()
    appointment_name = models.CharField(max_length=255)
    guests = models.TextField(blank=True, null=True)
    meet_link = models.CharField(max_length=512, blank=True, null=True)
    timezone = models.CharField(max_length=60)
    deleted_at = models.DateTimeField(blank=True, null=True)
    reschedule_time = models.DateTimeField(blank=True, null=True)
    fk_contact = models.ForeignKey('ApiContact', models.DO_NOTHING, blank=True, null=True)
    eventid = models.CharField(db_column='eventId', max_length=512, blank=True, null=True)  # Field name made lowercase.
    appointment_end_at = models.DateTimeField(blank=True, null=True)
    appointment_start_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_appointment'


class ApiAppointmentContacts(models.Model):
    id = models.BigAutoField(primary_key=True)
    appointment = models.ForeignKey(ApiAppointment, models.DO_NOTHING)
    contact = models.ForeignKey('ApiContact', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_appointment_contacts'
        unique_together = (('appointment', 'contact'),)


class ApiBusinesscardemail(models.Model):
    id = models.BigAutoField(primary_key=True)
    receiver_name = models.CharField(max_length=255)
    message = models.TextField()
    receiver_email = models.CharField(max_length=254)
    timestamp = models.DateTimeField()
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_businesscardemail'


class ApiCaldav(models.Model):
    id = models.BigAutoField(primary_key=True)
    url = models.CharField(max_length=200)
    username = models.CharField(max_length=100)
    password = models.TextField()
    timestamp = models.DateTimeField()
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)
    platform = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'api_caldav'


class ApiCampain(models.Model):
    id = models.BigAutoField(primary_key=True)
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    timestamp = models.DateTimeField()
    emailid = models.CharField(max_length=254)
    logo = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_campain'


class ApiClient(models.Model):
    client_id = models.AutoField(primary_key=True)
    fk_user_id = models.BigIntegerField(blank=True, null=True)
    category = models.CharField(max_length=25)
    comment = models.CharField(max_length=1024, blank=True, null=True)
    message = models.CharField(max_length=1024, blank=True, null=True)
    address = models.CharField(max_length=1024, blank=True, null=True)
    email = models.CharField(max_length=254)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'api_client'


class ApiContact(models.Model):
    id = models.BigAutoField(primary_key=True)
    source_type = models.CharField(max_length=50)
    is_user = models.IntegerField()
    name = models.CharField(max_length=255)
    profile_pic = models.CharField(max_length=2048, blank=True, null=True)
    email = models.CharField(max_length=254, blank=True, null=True)
    additional_email = models.CharField(max_length=254, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    additional_phone = models.CharField(max_length=20, blank=True, null=True)
    birthday = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    about = models.TextField(blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)
    date_added = models.DateTimeField()
    priority = models.CharField(max_length=10)
    social_links = models.JSONField(blank=True, null=True)
    image = models.CharField(max_length=100)
    is_profile_pic = models.IntegerField()
    uploaded_at = models.DateTimeField()
    source_details = models.TextField(blank=True, null=True)
    is_archived = models.IntegerField()
    owner = models.ForeignKey('ApiUser', models.DO_NOTHING)
    user_profile = models.ForeignKey('ApiUser', models.DO_NOTHING, blank=True, null=True)
    designation = models.CharField(max_length=255, blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    pfp_color = models.TextField(blank=True, null=True)
    generated_text = models.TextField(blank=True, null=True)
    public_id = models.CharField(unique=True, max_length=32)
    slug = models.CharField(max_length=255, blank=True, null=True)
    last_reengagement_sent_at = models.DateTimeField(blank=True, null=True)
    created_from = models.CharField(max_length=50)
    external_id = models.CharField(max_length=255, blank=True, null=True)
    source = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'api_contact'
        unique_together = (('email', 'owner'),)


class ApiContactsales(models.Model):
    contact_sales_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.CharField(max_length=254)
    phone = models.CharField(max_length=15, blank=True, null=True)
    message = models.CharField(max_length=1024, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_contactsales'


class ApiContactshare(models.Model):
    id = models.BigAutoField(primary_key=True)
    token = models.CharField(unique=True, max_length=32)
    expires_at = models.DateTimeField(blank=True, null=True)
    is_active = models.IntegerField()
    created_at = models.DateTimeField()
    contact = models.ForeignKey(ApiContact, models.DO_NOTHING)
    shared_by = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_contactshare'


class ApiContacttag(models.Model):
    id = models.BigAutoField(primary_key=True)
    position = models.PositiveIntegerField()
    fk_contact = models.ForeignKey(ApiContact, models.DO_NOTHING)
    fk_tag = models.ForeignKey('ApiTag', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_contacttag'
        unique_together = (('fk_contact', 'fk_tag'),)


class ApiCoupon(models.Model):
    id = models.BigAutoField(primary_key=True)
    coupon_code = models.CharField(max_length=100)
    emailid = models.CharField(max_length=254)
    timestamp = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'api_coupon'


class ApiDate(models.Model):
    id = models.BigAutoField(primary_key=True)
    date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'api_date'


class ApiDigitalcard(models.Model):
    card_id = models.AutoField(primary_key=True)
    timestamp = models.DateField()
    status = models.IntegerField()
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=254)
    phone = models.CharField(max_length=30, blank=True, null=True)
    device = models.CharField(max_length=512)
    website = models.CharField(max_length=512, blank=True, null=True)
    issues = models.CharField(max_length=512)
    profession = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_digitalcard'


class ApiDigitalcardemail(models.Model):
    id = models.BigAutoField(primary_key=True)
    sender_name = models.CharField(max_length=255)
    message = models.TextField()
    user_email = models.CharField(max_length=254)
    timestamp = models.DateTimeField()
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_digitalcardemail'


class ApiEmail(models.Model):
    email_id = models.AutoField(primary_key=True)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    thread_link = models.CharField(max_length=200, blank=True, null=True)
    priority = models.CharField(max_length=10)
    image = models.CharField(max_length=100)
    is_profile_pic = models.IntegerField()
    uploaded_at = models.DateTimeField()
    source_details = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    pfp_color = models.TextField(blank=True, null=True)
    generated_text = models.TextField(blank=True, null=True)
    last_reengagement_sent_at = models.DateTimeField(blank=True, null=True)
    source = models.CharField(max_length=50)
    external_id = models.CharField(max_length=255, blank=True, null=True)
    created_from = models.CharField(max_length=50)
    owner = models.ForeignKey('ApiUser', models.DO_NOTHING)
    user_profile = models.ForeignKey('ApiUser', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_potentialcontact'
        unique_together = ('email', 'owner')


class ApiProfilecontactinfo(models.Model):
    id = models.BigAutoField(primary_key=True)
    contact_type = models.CharField(max_length=10)
    value = models.CharField(max_length=255)
    label = models.CharField(max_length=20)
    created_at = models.DateTimeField()
    fk_profile = models.ForeignKey('ApiProfiles', models.DO_NOTHING, blank=True, null=True)
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_profilecontactinfo'


class ApiProfilelayout(models.Model):
    id = models.BigAutoField(primary_key=True)
    sections_order = models.JSONField()
    updated_at = models.DateTimeField()
    fk_profile = models.ForeignKey('ApiProfiles', models.DO_NOTHING, blank=True, null=True)
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_profilelayout'


class ApiProfileprogress(models.Model):
    id = models.BigAutoField(primary_key=True)
    is_open = models.IntegerField()
    timestamp = models.DateTimeField()
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_profileprogress'


class ApiProfiles(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=1024)
    profile_picture = models.CharField(max_length=100)
    about = models.TextField(blank=True, null=True)
    instagram = models.CharField(max_length=512, blank=True, null=True)
    facebook = models.CharField(max_length=512, blank=True, null=True)
    linkedin = models.CharField(max_length=512, blank=True, null=True)
    twitter = models.CharField(max_length=512, blank=True, null=True)
    tiktok = models.CharField(max_length=512, blank=True, null=True)
    youtube = models.CharField(max_length=512, blank=True, null=True)
    background_pattern = models.CharField(max_length=512, blank=True, null=True)
    background_pattern_profile = models.CharField(max_length=512, blank=True, null=True)
    company = models.CharField(max_length=1024, blank=True, null=True)
    designation = models.CharField(max_length=1024, blank=True, null=True)
    card_name = models.CharField(max_length=512, blank=True, null=True)
    background_colour = models.CharField(max_length=512, blank=True, null=True)
    username = models.CharField(unique=True, max_length=150, blank=True, null=True)
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)
    wlcm_message = models.JSONField()
    logo = models.CharField(max_length=255, blank=True, null=True)
    is_review = models.IntegerField()
    is_feature_images = models.IntegerField()
    is_feature_video = models.IntegerField()
    is_links = models.IntegerField()
    is_service = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'api_profiles'


class ApiProfileservice(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=512)
    desc = models.CharField(max_length=1024)
    sorting_id = models.IntegerField()
    url = models.CharField(max_length=512)
    service_img = models.CharField(max_length=100, blank=True, null=True)
    fk_profile = models.ForeignKey(ApiProfiles, models.DO_NOTHING)
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_profileservice'


class ApiProfilesgallery(models.Model):
    id = models.BigAutoField(primary_key=True)
    timestamp = models.DateField()
    status = models.CharField(max_length=10)
    pictures = models.CharField(max_length=100)
    fk_profile = models.ForeignKey(ApiProfiles, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_profilesgallery'


class ApiProfilesreview(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=512, blank=True, null=True)
    ratings = models.DecimalField(max_digits=2, decimal_places=1)
    comments = models.CharField(max_length=512)
    create_date = models.DateField()
    update_date = models.DateField()
    status = models.CharField(max_length=10)
    email = models.CharField(max_length=512, blank=True, null=True)
    fk_contact = models.ForeignKey(ApiContact, models.DO_NOTHING, blank=True, null=True)
    fk_profile = models.ForeignKey(ApiProfiles, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_profilesreview'


class ApiProfilevideolink(models.Model):
    id = models.BigAutoField(primary_key=True)
    title = models.TextField()
    video_link = models.CharField(max_length=200, blank=True, null=True)
    upload_video = models.CharField(max_length=100, blank=True, null=True)
    fk_profile = models.ForeignKey(ApiProfiles, models.DO_NOTHING, blank=True, null=True)
    fk_user_id = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = 'api_profilevideolink'


class ApiProfilevisit(models.Model):
    id = models.BigAutoField(primary_key=True)
    session_key = models.CharField(max_length=40)
    ip_address = models.CharField(max_length=39)
    user_agent = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField()
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING, blank=True, null=True)
    fk_profile = models.ForeignKey(ApiProfiles, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_profilevisit'
        unique_together = (('session_key', 'fk_profile', 'ip_address'), ('session_key', 'fk_user', 'ip_address'),)


class ApiPublicreview(models.Model):
    public_review_id = models.AutoField(primary_key=True)
    ratings = models.DecimalField(max_digits=2, decimal_places=1)
    comments = models.CharField(max_length=512)
    create_date = models.DateField()
    update_date = models.DateField()
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=254)

    class Meta:
        managed = False
        db_table = 'api_publicreview'


class ApiReceivecardemail(models.Model):
    id = models.BigAutoField(primary_key=True)
    receiver_email = models.CharField(max_length=254)
    timestamp = models.DateTimeField()
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_receivecardemail'


class ApiReferralcode(models.Model):
    id = models.BigAutoField(primary_key=True)
    code = models.CharField(unique=True, max_length=20)
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_referralcode'


class ApiReferralemail(models.Model):
    id = models.BigAutoField(primary_key=True)
    referral_email = models.CharField(max_length=254)
    timestamp = models.DateTimeField()
    referral_coupon_friends = models.CharField(max_length=120)
    referral_coupon_users = models.CharField(max_length=120)
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_referralemail'


class ApiReferralrelationship(models.Model):
    id = models.BigAutoField(primary_key=True)
    # host_advisor = models.ForeignKey(ApiAdvisor, models.DO_NOTHING, blank=True, null=True)
    # referred_advisor = models.ForeignKey(ApiAdvisor, models.DO_NOTHING, blank=True, null=True)
    is_rewarded = models.IntegerField()
    is_scheduled = models.IntegerField()
    host_user = models.ForeignKey('ApiUser', models.DO_NOTHING)
    referred_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_referralrelationship'


class ApiReview(models.Model):
    review_id = models.AutoField(primary_key=True)
    ratings = models.DecimalField(max_digits=2, decimal_places=1)
    comments = models.CharField(max_length=512)
    create_date = models.DateField()
    update_date = models.DateField()
    status = models.CharField(max_length=10)
    name = models.CharField(max_length=512, blank=True, null=True)
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)
    fk_contact = models.ForeignKey(ApiContact, models.DO_NOTHING, blank=True, null=True)
    email = models.CharField(max_length=512, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_review'


class ApiService(models.Model):
    service_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=512)
    desc = models.CharField(max_length=1024)
    sorting_id = models.IntegerField()
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)
    url = models.CharField(max_length=512)
    service_img = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_service'


class ApiSmartcardintent(models.Model):
    id = models.BigAutoField(primary_key=True)
    email = models.CharField(max_length=254)
    designation = models.CharField(max_length=255, blank=True, null=True)
    card_type = models.CharField(max_length=50)
    logo = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField()
    expires_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'api_smartcardintent'


class ApiStripedetails(models.Model):
    stripe_detail_id = models.AutoField(primary_key=True)
    timestamp = models.DateField()
    status = models.IntegerField()
    product_name = models.CharField(max_length=255)
    desc = models.CharField(max_length=1024, blank=True, null=True)
    trial_days = models.IntegerField(blank=True, null=True)
    monthly_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    monthly_price_id = models.CharField(max_length=255, blank=True, null=True)
    yearly_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    yearly_price_id = models.CharField(max_length=255, blank=True, null=True)
    product_id = models.CharField(max_length=255)
    quarterly_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    quarterly_price_id = models.CharField(max_length=255, blank=True, null=True)
    one_time_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    one_time_price_id = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_stripedetails'


class ApiTag(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    color = models.CharField(max_length=7)
    info_desc = models.TextField(blank=True, null=True)
    is_default = models.IntegerField()
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING, blank=True, null=True)
    info_title = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_tag'
        unique_together = (('fk_user', 'name'),)


class ApiTeamSocialhandle(models.Model):
    id = models.BigAutoField(primary_key=True)
    fk_advisor_id = models.IntegerField(blank=True, null=True)
    facebook = models.CharField(max_length=512, blank=True, null=True)
    instagram = models.CharField(max_length=512, blank=True, null=True)
    linkedin = models.CharField(max_length=512, blank=True, null=True)
    tiktok = models.CharField(max_length=512, blank=True, null=True)
    twitter = models.CharField(max_length=512, blank=True, null=True)
    youtube = models.CharField(max_length=512, blank=True, null=True)
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_team_socialhandle'


class ApiTeamadvisorgallery(models.Model):
    gallery_id = models.AutoField(primary_key=True)
    timestamp = models.DateField()
    status = models.CharField(max_length=10)
    pictures = models.CharField(max_length=100)
    column_number = models.IntegerField()
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_teamadvisorgallery'


class ApiTeamgallery(models.Model):
    team_gallery_id = models.AutoField(primary_key=True)
    profile_picture = models.CharField(max_length=100)
    joined_date = models.DateField()
    name = models.CharField(max_length=255)
    ratings = models.DecimalField(max_digits=2, decimal_places=1, blank=True, null=True)
    status = models.CharField(max_length=10)
    story = models.CharField(max_length=512, blank=True, null=True)
    created_date = models.DateTimeField()
    heading = models.CharField(max_length=512, blank=True, null=True)
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_teamgallery'


class ApiTeamlink(models.Model):
    id = models.BigAutoField(primary_key=True)
    link = models.CharField(max_length=200)
    title = models.CharField(max_length=500)
    description = models.CharField(max_length=1000, blank=True, null=True)
    fk_advisor_id = models.IntegerField(blank=True, null=True)
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_teamlink'


class ApiTeammember(models.Model):
    team_member_id = models.AutoField(primary_key=True)
    fk_advisor_id = models.IntegerField(blank=True, null=True)
    fk_member_id = models.IntegerField(blank=True, null=True)
    fk_user_id = models.BigIntegerField()
    fk_user_member_id = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = 'api_teammember'
        unique_together = (('fk_user_member_id', 'fk_user_id'),)


class ApiTeamreferralrelationship(models.Model):
    id = models.BigAutoField(primary_key=True)
    admin_user = models.ForeignKey('ApiUser', models.DO_NOTHING)
    team_user = models.OneToOneField('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_teamreferralrelationship'


class ApiTeamservice(models.Model):
    service_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=512)
    desc = models.CharField(max_length=1024)
    fk_advisor_id = models.IntegerField(blank=True, null=True)
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_teamservice'
    sorting_id = models.IntegerField()
    fk_profile = models.ForeignKey(ApiProfiles, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_userlink'


class ApiUsershippingaddress(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    phoneno = models.CharField(max_length=20)
    apartment_details = models.TextField()
    area_details = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    shipping_zip = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=100)
    created_at = models.DateTimeField()
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_usershippingaddress'


class ApiVideolink(models.Model):
    id = models.BigAutoField(primary_key=True)
    title = models.TextField()
    video_link = models.CharField(max_length=200, blank=True, null=True)
    fk_user_id = models.BigIntegerField()
    upload_video = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_videolink'


class ApiWebpgallery(models.Model):
    id = models.BigAutoField(primary_key=True)
    webp_image = models.CharField(unique=True, max_length=100)
    timestamp = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'api_webpgallery'


class ApiWorkinghour(models.Model):
    working_hour_id = models.AutoField(primary_key=True)
    dayname = models.IntegerField(db_column='dayName')  # Field name made lowercase.
    status = models.CharField(max_length=10, blank=True, null=True)
    working_hour = models.JSONField(blank=True, null=True)
    timezone = models.CharField(max_length=100)
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_workinghour'


class ApiZapier(models.Model):
    id = models.BigAutoField(primary_key=True)
    zapier_key = models.CharField(unique=True, max_length=255)
    timestamp = models.DateTimeField()
    fk_user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_zapier'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoCeleryBeatClockedschedule(models.Model):
    clocked_time = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_celery_beat_clockedschedule'


class DjangoCeleryBeatCrontabschedule(models.Model):
    minute = models.CharField(max_length=240)
    hour = models.CharField(max_length=96)
    day_of_week = models.CharField(max_length=64)
    day_of_month = models.CharField(max_length=124)
    month_of_year = models.CharField(max_length=64)
    timezone = models.CharField(max_length=63)

    class Meta:
        managed = False
        db_table = 'django_celery_beat_crontabschedule'


class DjangoCeleryBeatIntervalschedule(models.Model):
    every = models.IntegerField()
    period = models.CharField(max_length=24)

    class Meta:
        managed = False
        db_table = 'django_celery_beat_intervalschedule'


class DjangoCeleryBeatPeriodictask(models.Model):
    name = models.CharField(unique=True, max_length=200)
    task = models.CharField(max_length=200)
    args = models.TextField()
    kwargs = models.TextField(blank=True, null=True)
    queue = models.CharField(max_length=200, blank=True, null=True)
    exchange = models.CharField(max_length=200, blank=True, null=True)
    routing_key = models.CharField(max_length=200, blank=True, null=True)
    expires = models.DateTimeField(blank=True, null=True)
    enabled = models.IntegerField()
    last_run_at = models.DateTimeField(blank=True, null=True)
    total_run_count = models.IntegerField()
    date_changed = models.DateTimeField()
    description = models.TextField(blank=True, null=True)
    crontab = models.ForeignKey(DjangoCeleryBeatCrontabschedule, models.DO_NOTHING, blank=True, null=True)
    interval = models.ForeignKey(DjangoCeleryBeatIntervalschedule, models.DO_NOTHING, blank=True, null=True)
    solar = models.ForeignKey('DjangoCeleryBeatSolarschedule', models.DO_NOTHING, blank=True, null=True)
    one_off = models.IntegerField()
    start_time = models.DateTimeField(blank=True, null=True)
    priority = models.IntegerField(blank=True, null=True)
    headers = models.TextField(blank=True, null=True)
    clocked = models.ForeignKey(DjangoCeleryBeatClockedschedule, models.DO_NOTHING, blank=True, null=True)
    expire_seconds = models.PositiveIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'django_celery_beat_periodictask'


class DjangoCeleryBeatPeriodictasks(models.Model):
    ident = models.SmallIntegerField(primary_key=True)
    last_update = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_celery_beat_periodictasks'


class DjangoCeleryBeatSolarschedule(models.Model):
    event = models.CharField(max_length=24)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        managed = False
        db_table = 'django_celery_beat_solarschedule'
        unique_together = (('event', 'latitude', 'longitude'),)


class DjangoCeleryResultsChordcounter(models.Model):
    group_id = models.CharField(unique=True, max_length=255)
    sub_tasks = models.TextField()
    count = models.PositiveIntegerField()

    class Meta:
        managed = False
        db_table = 'django_celery_results_chordcounter'


class DjangoCeleryResultsGroupresult(models.Model):
    group_id = models.CharField(unique=True, max_length=255)
    date_created = models.DateTimeField()
    date_done = models.DateTimeField()
    content_type = models.CharField(max_length=128)
    content_encoding = models.CharField(max_length=64)
    result = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'django_celery_results_groupresult'


class DjangoCeleryResultsTaskresult(models.Model):
    task_id = models.CharField(unique=True, max_length=255)
    status = models.CharField(max_length=50)
    content_type = models.CharField(max_length=128)
    content_encoding = models.CharField(max_length=64)
    result = models.TextField(blank=True, null=True)
    date_done = models.DateTimeField()
    traceback = models.TextField(blank=True, null=True)
    meta = models.TextField(blank=True, null=True)
    task_args = models.TextField(blank=True, null=True)
    task_kwargs = models.TextField(blank=True, null=True)
    task_name = models.CharField(max_length=255, blank=True, null=True)
    worker = models.CharField(max_length=100, blank=True, null=True)
    date_created = models.DateTimeField()
    periodic_task_name = models.CharField(max_length=255, blank=True, null=True)
    date_started = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'django_celery_results_taskresult'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class DjangoSite(models.Model):
    domain = models.CharField(unique=True, max_length=100)
    name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'django_site'


class MailerDontsendentry(models.Model):
    id = models.BigAutoField(primary_key=True)
    to_address = models.CharField(max_length=254)
    when_added = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'mailer_dontsendentry'


class MailerMessage(models.Model):
    id = models.BigAutoField(primary_key=True)
    message_data = models.TextField()
    when_added = models.DateTimeField()
    priority = models.PositiveSmallIntegerField()
    retry_count = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'mailer_message'


class MailerMessagelog(models.Model):
    id = models.BigAutoField(primary_key=True)
    message_data = models.TextField(blank=True, null=True)
    when_added = models.DateTimeField()
    priority = models.PositiveSmallIntegerField()
    when_attempted = models.DateTimeField()
    result = models.CharField(max_length=1)
    log_message = models.TextField()
    message_id = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'mailer_messagelog'


class SocialaccountSocialaccount(models.Model):
    provider = models.CharField(max_length=200)
    uid = models.CharField(max_length=191)
    last_login = models.DateTimeField()
    date_joined = models.DateTimeField()
    extra_data = models.JSONField()
    user = models.ForeignKey('ApiUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'socialaccount_socialaccount'
        unique_together = (('provider', 'uid'),)


class SocialaccountSocialapp(models.Model):
    provider = models.CharField(max_length=30)
    name = models.CharField(max_length=40)
    client_id = models.CharField(max_length=191)
    secret = models.CharField(max_length=191)
    key = models.CharField(max_length=191)
    provider_id = models.CharField(max_length=200)
    settings = models.JSONField()

    class Meta:
        managed = False
        db_table = 'socialaccount_socialapp'


class SocialaccountSocialappSites(models.Model):
    id = models.BigAutoField(primary_key=True)
    socialapp = models.ForeignKey(SocialaccountSocialapp, models.DO_NOTHING)
    site = models.ForeignKey(DjangoSite, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'socialaccount_socialapp_sites'
        unique_together = (('socialapp', 'site'),)


class SocialaccountSocialtoken(models.Model):
    token = models.TextField()
    token_secret = models.TextField()
    expires_at = models.DateTimeField(blank=True, null=True)
    account = models.ForeignKey(SocialaccountSocialaccount, models.DO_NOTHING)
    app = models.ForeignKey(SocialaccountSocialapp, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'socialaccount_socialtoken'
        unique_together = (('app', 'account'),)
