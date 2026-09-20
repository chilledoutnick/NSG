from api.models.AdvisorLogo import AdvisorLogo, AdvisorProfileLogo
from api.models.TeamAdmin import AdminAdvisor, TeamReferralRelationship


def get_final_logo(user, profile=None):

    def exists(file_field):
        return file_field and getattr(file_field, "name", None)

    # 1. Admin Logo
    if profile:
        team_rel = TeamReferralRelationship.objects.filter(team_user=profile.fk_user).first()
    else:
        team_rel = TeamReferralRelationship.objects.filter(team_user=user).first()

    if team_rel:
        admin_user = AdminAdvisor.objects.filter(fk_user=team_rel.admin_user).first()
    else:
        admin_user = AdminAdvisor.objects.filter(fk_user=user).first()

    if admin_user and exists(admin_user.logo):
        return admin_user.logo.url

    # 2. User / Profile Logo
    if profile is None:
        user_logo = AdvisorLogo.objects.filter(fk_user=user).first()
        if user_logo and exists(user_logo.logo):
            return user_logo.logo.url
    else:
        profile_logo = AdvisorProfileLogo.objects.filter(fk_profile=profile).first()
        if profile_logo and exists(profile_logo.logo):
            return profile_logo.logo.url

    # 3. Default fallback
    return None
