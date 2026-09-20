-- ============================================================================
-- NSG CRM (Network Sales & Growth) — Clean Database Schema Baseline
-- Compatible with MySQL 8.0+
-- Generated for Fresh Database Initialization
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `account_emailaddress` (
  `email` VARCHAR(254) NOT NULL,
  `verified` INT NOT NULL,
  `primary` INT NOT NULL,
  `user_id` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `account_emailconfirmation` (
  `created` DATETIME(6) NOT NULL,
  `sent` DATETIME(6) NULL,
  `key` VARCHAR(64) NOT NULL,
  `email_address_id` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_adminadvisor` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `logo` VARCHAR(100) NULL,
  `color` VARCHAR(20) NOT NULL,
  `team_limit` INT NOT NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_advisorappointment` (
  `advisor_appointment_id` INT AUTO_INCREMENT NOT NULL,
  `timestamp` DATE NOT NULL,
  `status` VARCHAR(10) NOT NULL,
  `fk_appointment` BIGINT NOT NULL,
  `owner` INT NOT NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`advisor_appointment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_advisorgallery` (
  `gallery_id` INT AUTO_INCREMENT NOT NULL,
  `timestamp` DATE NOT NULL,
  `status` VARCHAR(10) NOT NULL,
  `pictures` VARCHAR(100) NOT NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`gallery_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_advisorlogo` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `logo` VARCHAR(100) NOT NULL,
  `timestamp` DATETIME(6) NOT NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_advisorprofilelogo` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `logo` VARCHAR(100) NOT NULL,
  `timestamp` DATETIME(6) NOT NULL,
  `fk_profile` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_advisorslottime` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `slot_time` JSON NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_agent` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `info` VARCHAR(1024) NOT NULL,
  `agent_id` VARCHAR(512) NOT NULL,
  `secret_key` VARCHAR(1024) NOT NULL,
  `fk_user_id` BIGINT NULL,
  `owner` VARCHAR(1024) NOT NULL,
  `agent_username` VARCHAR(512) NOT NULL,
  `created_at` DATETIME(6) NOT NULL,
  `language` VARCHAR(20) NOT NULL,
  `prompt` LONGTEXT NOT NULL,
  `twilio_number` VARCHAR(20) NULL,
  `voice_id` VARCHAR(100) NOT NULL,
  `client_name` VARCHAR(512) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_applepass` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `applepass` VARCHAR(100) NOT NULL,
  `timestamp` DATETIME(6) NOT NULL,
  `fk_user` BIGINT NOT NULL,
  `username` VARCHAR(120) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_appointment` (
  `appointment_id` INT AUTO_INCREMENT NOT NULL,
  `create_date` DATE NOT NULL,
  `create_time` TIME(6) NOT NULL,
  `update_date` DATE NOT NULL,
  `update_time` TIME(6) NOT NULL,
  `appointment_date` DATE NOT NULL,
  `appointment_time` TIME(6) NOT NULL,
  `status` VARCHAR(10) NOT NULL,
  `duration` INT NOT NULL,
  `appointment_name` VARCHAR(255) NOT NULL,
  `guests` LONGTEXT NULL,
  `meet_link` VARCHAR(512) NULL,
  `timezone` VARCHAR(60) NOT NULL,
  `deleted_at` DATETIME(6) NULL,
  `reschedule_time` DATETIME(6) NULL,
  `fk_contact` BIGINT NULL,
  `eventid` VARCHAR(512) NULL,
  `appointment_end_at` DATETIME(6) NULL,
  `appointment_start_at` DATETIME(6) NULL,
  PRIMARY KEY (`appointment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_appointment_contacts` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `appointment_id` BIGINT NOT NULL,
  `contact_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_businesscardemail` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `receiver_name` VARCHAR(255) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `receiver_email` VARCHAR(254) NOT NULL,
  `timestamp` DATETIME(6) NOT NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_caldav` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `url` VARCHAR(200) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `password` LONGTEXT NOT NULL,
  `timestamp` DATETIME(6) NOT NULL,
  `fk_user` BIGINT NOT NULL,
  `platform` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_campain` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `firstname` VARCHAR(100) NOT NULL,
  `lastname` VARCHAR(100) NOT NULL,
  `company` VARCHAR(100) NOT NULL,
  `timestamp` DATETIME(6) NOT NULL,
  `emailid` VARCHAR(254) NOT NULL,
  `logo` VARCHAR(100) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_client` (
  `client_id` INT AUTO_INCREMENT NOT NULL,
  `fk_user_id` BIGINT NULL,
  `category` VARCHAR(25) NOT NULL,
  `comment` VARCHAR(1024) NULL,
  `message` VARCHAR(1024) NULL,
  `address` VARCHAR(1024) NULL,
  `email` VARCHAR(254) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `date_joined` DATETIME(6) NOT NULL,
  PRIMARY KEY (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_contact` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `source_type` VARCHAR(50) NOT NULL,
  `is_user` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `profile_pic` VARCHAR(2048) NULL,
  `email` VARCHAR(254) NULL,
  `additional_email` VARCHAR(254) NULL,
  `phone` VARCHAR(20) NULL,
  `additional_phone` VARCHAR(20) NULL,
  `birthday` DATE NULL,
  `address` LONGTEXT NULL,
  `about` LONGTEXT NULL,
  `company` VARCHAR(255) NULL,
  `date_added` DATETIME(6) NOT NULL,
  `priority` VARCHAR(10) NOT NULL,
  `social_links` JSON NULL,
  `image` VARCHAR(100) NOT NULL,
  `is_profile_pic` INT NOT NULL,
  `uploaded_at` DATETIME(6) NOT NULL,
  `source_details` LONGTEXT NULL,
  `is_archived` INT NOT NULL,
  `owner_id` BIGINT NOT NULL,
  `user_profile_id` BIGINT NULL,
  `designation` VARCHAR(255) NULL,
  `updated_at` DATETIME(6) NULL,
  `pfp_color` LONGTEXT NULL,
  `generated_text` LONGTEXT NULL,
  `public_id` VARCHAR(32) NOT NULL,
  `slug` VARCHAR(255) NULL,
  `last_reengagement_sent_at` DATETIME(6) NULL,
  `created_from` VARCHAR(50) NOT NULL,
  `external_id` VARCHAR(255) NULL,
  `source` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_contactsales` (
  `contact_sales_id` INT AUTO_INCREMENT NOT NULL,
  `first_name` VARCHAR(255) NULL,
  `last_name` VARCHAR(255) NULL,
  `email` VARCHAR(254) NOT NULL,
  `phone` VARCHAR(15) NULL,
  `message` VARCHAR(1024) NULL,
  PRIMARY KEY (`contact_sales_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_contactshare` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `token` VARCHAR(32) NOT NULL,
  `expires_at` DATETIME(6) NULL,
  `is_active` INT NOT NULL,
  `created_at` DATETIME(6) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `shared_by_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_contacttag` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `position` INT NOT NULL,
  `fk_contact` BIGINT NOT NULL,
  `fk_tag` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_coupon` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `coupon_code` VARCHAR(100) NOT NULL,
  `emailid` VARCHAR(254) NOT NULL,
  `timestamp` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_date` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `date` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_digitalcard` (
  `card_id` INT AUTO_INCREMENT NOT NULL,
  `timestamp` DATE NOT NULL,
  `status` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `device` VARCHAR(512) NOT NULL,
  `website` VARCHAR(512) NULL,
  `issues` VARCHAR(512) NOT NULL,
  `profession` VARCHAR(255) NULL,
  PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_digitalcardemail` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `sender_name` VARCHAR(255) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `user_email` VARCHAR(254) NOT NULL,
  `timestamp` DATETIME(6) NOT NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_potentialcontact` (
  `email_id` INT AUTO_INCREMENT NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `body` LONGTEXT NOT NULL,
  `thread_link` VARCHAR(200) NULL,
  `priority` VARCHAR(10) NOT NULL,
  `image` VARCHAR(100) NOT NULL,
  `is_profile_pic` INT NOT NULL,
  `uploaded_at` DATETIME(6) NOT NULL,
  `source_details` LONGTEXT NULL,
  `updated_at` DATETIME(6) NULL,
  `pfp_color` LONGTEXT NULL,
  `generated_text` LONGTEXT NULL,
  `last_reengagement_sent_at` DATETIME(6) NULL,
  `source` VARCHAR(50) NOT NULL,
  `external_id` VARCHAR(255) NULL,
  `created_from` VARCHAR(50) NOT NULL,
  `owner_id` BIGINT NOT NULL,
  `user_profile_id` BIGINT NULL,
  PRIMARY KEY (`email_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_profilecontactinfo` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `contact_type` VARCHAR(10) NOT NULL,
  `value` VARCHAR(255) NOT NULL,
  `label` VARCHAR(20) NOT NULL,
  `created_at` DATETIME(6) NOT NULL,
  `fk_profile` BIGINT NULL,
  `fk_user` BIGINT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_profilelayout` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `sections_order` JSON NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  `fk_profile` BIGINT NULL,
  `fk_user` BIGINT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_profileprogress` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `is_open` INT NOT NULL,
  `timestamp` DATETIME(6) NOT NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_profiles` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(1024) NOT NULL,
  `profile_picture` VARCHAR(100) NOT NULL,
  `about` LONGTEXT NULL,
  `instagram` VARCHAR(512) NULL,
  `facebook` VARCHAR(512) NULL,
  `linkedin` VARCHAR(512) NULL,
  `twitter` VARCHAR(512) NULL,
  `tiktok` VARCHAR(512) NULL,
  `youtube` VARCHAR(512) NULL,
  `background_pattern` VARCHAR(512) NULL,
  `background_pattern_profile` VARCHAR(512) NULL,
  `company` VARCHAR(1024) NULL,
  `designation` VARCHAR(1024) NULL,
  `card_name` VARCHAR(512) NULL,
  `background_colour` VARCHAR(512) NULL,
  `username` VARCHAR(150) NULL,
  `fk_user` BIGINT NOT NULL,
  `wlcm_message` JSON NOT NULL,
  `logo` VARCHAR(255) NULL,
  `is_review` INT NOT NULL,
  `is_feature_images` INT NOT NULL,
  `is_feature_video` INT NOT NULL,
  `is_links` INT NOT NULL,
  `is_service` INT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_profileservice` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(512) NOT NULL,
  `desc` VARCHAR(1024) NOT NULL,
  `sorting_id` INT NOT NULL,
  `url` VARCHAR(512) NOT NULL,
  `service_img` VARCHAR(100) NULL,
  `fk_profile` BIGINT NOT NULL,
  `fk_user` BIGINT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_profilesgallery` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `timestamp` DATE NOT NULL,
  `status` VARCHAR(10) NOT NULL,
  `pictures` VARCHAR(100) NOT NULL,
  `fk_profile` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_profilesreview` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(512) NULL,
  `ratings` DECIMAL(12, 4) NOT NULL,
  `comments` VARCHAR(512) NOT NULL,
  `create_date` DATE NOT NULL,
  `update_date` DATE NOT NULL,
  `status` VARCHAR(10) NOT NULL,
  `email` VARCHAR(512) NULL,
  `fk_contact` BIGINT NULL,
  `fk_profile` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_profilevideolink` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `title` LONGTEXT NOT NULL,
  `video_link` VARCHAR(200) NULL,
  `upload_video` VARCHAR(100) NULL,
  `fk_profile` BIGINT NULL,
  `fk_user_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_profilevisit` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `session_key` VARCHAR(40) NOT NULL,
  `ip_address` VARCHAR(39) NOT NULL,
  `user_agent` LONGTEXT NULL,
  `timestamp` DATETIME(6) NOT NULL,
  `fk_user` BIGINT NULL,
  `fk_profile` BIGINT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_publicreview` (
  `public_review_id` INT AUTO_INCREMENT NOT NULL,
  `ratings` DECIMAL(12, 4) NOT NULL,
  `comments` VARCHAR(512) NOT NULL,
  `create_date` DATE NOT NULL,
  `update_date` DATE NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  PRIMARY KEY (`public_review_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_receivecardemail` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `receiver_email` VARCHAR(254) NOT NULL,
  `timestamp` DATETIME(6) NOT NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_referralcode` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_referralemail` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `referral_email` VARCHAR(254) NOT NULL,
  `timestamp` DATETIME(6) NOT NULL,
  `referral_coupon_friends` VARCHAR(120) NOT NULL,
  `referral_coupon_users` VARCHAR(120) NOT NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_referralrelationship` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `is_rewarded` INT NOT NULL,
  `is_scheduled` INT NOT NULL,
  `host_user_id` BIGINT NOT NULL,
  `referred_user_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_review` (
  `review_id` INT AUTO_INCREMENT NOT NULL,
  `ratings` DECIMAL(12, 4) NOT NULL,
  `comments` VARCHAR(512) NOT NULL,
  `create_date` DATE NOT NULL,
  `update_date` DATE NOT NULL,
  `status` VARCHAR(10) NOT NULL,
  `name` VARCHAR(512) NULL,
  `fk_user` BIGINT NOT NULL,
  `fk_contact` BIGINT NULL,
  `email` VARCHAR(512) NULL,
  PRIMARY KEY (`review_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_service` (
  `service_id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(512) NOT NULL,
  `desc` VARCHAR(1024) NOT NULL,
  `sorting_id` INT NOT NULL,
  `fk_user` BIGINT NOT NULL,
  `url` VARCHAR(512) NOT NULL,
  `service_img` VARCHAR(100) NULL,
  PRIMARY KEY (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_smartcardintent` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `designation` VARCHAR(255) NULL,
  `card_type` VARCHAR(50) NOT NULL,
  `logo` VARCHAR(100) NULL,
  `created_at` DATETIME(6) NOT NULL,
  `expires_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_stripedetails` (
  `stripe_detail_id` INT AUTO_INCREMENT NOT NULL,
  `timestamp` DATE NOT NULL,
  `status` INT NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(1024) NULL,
  `trial_days` INT NULL,
  `monthly_price` DECIMAL(12, 4) NULL,
  `monthly_price_id` VARCHAR(255) NULL,
  `yearly_price` DECIMAL(12, 4) NULL,
  `yearly_price_id` VARCHAR(255) NULL,
  `product_id` VARCHAR(255) NOT NULL,
  `quarterly_price` DECIMAL(12, 4) NULL,
  `quarterly_price_id` VARCHAR(255) NULL,
  `one_time_price` DECIMAL(12, 4) NULL,
  `one_time_price_id` VARCHAR(255) NULL,
  PRIMARY KEY (`stripe_detail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_tag` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `color` VARCHAR(7) NOT NULL,
  `info_desc` LONGTEXT NULL,
  `is_default` INT NOT NULL,
  `fk_user` BIGINT NULL,
  `info_title` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_team_socialhandle` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `fk_advisor_id` INT NULL,
  `facebook` VARCHAR(512) NULL,
  `instagram` VARCHAR(512) NULL,
  `linkedin` VARCHAR(512) NULL,
  `tiktok` VARCHAR(512) NULL,
  `twitter` VARCHAR(512) NULL,
  `youtube` VARCHAR(512) NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_teamadvisorgallery` (
  `gallery_id` INT AUTO_INCREMENT NOT NULL,
  `timestamp` DATE NOT NULL,
  `status` VARCHAR(10) NOT NULL,
  `pictures` VARCHAR(100) NOT NULL,
  `column_number` INT NOT NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`gallery_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_teamgallery` (
  `team_gallery_id` INT AUTO_INCREMENT NOT NULL,
  `profile_picture` VARCHAR(100) NOT NULL,
  `joined_date` DATE NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `ratings` DECIMAL(12, 4) NULL,
  `status` VARCHAR(10) NOT NULL,
  `story` VARCHAR(512) NULL,
  `created_date` DATETIME(6) NOT NULL,
  `heading` VARCHAR(512) NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`team_gallery_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_teamlink` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `link` VARCHAR(200) NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `description` VARCHAR(1000) NULL,
  `fk_advisor_id` INT NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_teammember` (
  `team_member_id` INT AUTO_INCREMENT NOT NULL,
  `fk_advisor_id` INT NULL,
  `fk_member_id` INT NULL,
  `fk_user_id` BIGINT NOT NULL,
  `fk_user_member_id` BIGINT NOT NULL,
  PRIMARY KEY (`team_member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_teamreferralrelationship` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `admin_user_id` BIGINT NOT NULL,
  `team_user_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_teamservice` (
  `service_id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(512) NOT NULL,
  `desc` VARCHAR(1024) NOT NULL,
  `fk_advisor_id` INT NULL,
  `fk_user` BIGINT NOT NULL,
  `sorting_id` INT NOT NULL,
  `fk_profile` BIGINT NULL,
  PRIMARY KEY (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_usershippingaddress` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(50) NOT NULL,
  `phoneno` VARCHAR(20) NOT NULL,
  `apartment_details` LONGTEXT NOT NULL,
  `area_details` VARCHAR(100) NOT NULL,
  `province` VARCHAR(100) NOT NULL,
  `shipping_zip` VARCHAR(20) NOT NULL,
  `shipping_country` VARCHAR(100) NOT NULL,
  `created_at` DATETIME(6) NOT NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_videolink` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `title` LONGTEXT NOT NULL,
  `video_link` VARCHAR(200) NULL,
  `fk_user_id` BIGINT NOT NULL,
  `upload_video` VARCHAR(100) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_webpgallery` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `webp_image` VARCHAR(100) NOT NULL,
  `timestamp` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_workinghour` (
  `working_hour_id` INT AUTO_INCREMENT NOT NULL,
  `dayname` INT NOT NULL,
  `status` VARCHAR(10) NULL,
  `working_hour` JSON NULL,
  `timezone` VARCHAR(100) NOT NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`working_hour_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `api_zapier` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `zapier_key` VARCHAR(255) NOT NULL,
  `timestamp` DATETIME(6) NOT NULL,
  `fk_user` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auth_group` (
  `name` VARCHAR(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auth_group_permissions` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `group_id` BIGINT NOT NULL,
  `permission_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auth_permission` (
  `name` VARCHAR(255) NOT NULL,
  `content_type_id` BIGINT NOT NULL,
  `codename` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `django_admin_log` (
  `action_time` DATETIME(6) NOT NULL,
  `object_id` LONGTEXT NULL,
  `object_repr` VARCHAR(200) NOT NULL,
  `action_flag` VARCHAR(255) NOT NULL,
  `change_message` LONGTEXT NOT NULL,
  `content_type_id` BIGINT NULL,
  `user_id` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `django_celery_beat_clockedschedule` (
  `clocked_time` DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `django_celery_beat_crontabschedule` (
  `minute` VARCHAR(240) NOT NULL,
  `hour` VARCHAR(96) NOT NULL,
  `day_of_week` VARCHAR(64) NOT NULL,
  `day_of_month` VARCHAR(124) NOT NULL,
  `month_of_year` VARCHAR(64) NOT NULL,
  `timezone` VARCHAR(63) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `django_celery_beat_intervalschedule` (
  `every` INT NOT NULL,
  `period` VARCHAR(24) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `django_celery_beat_periodictask` (
  `name` VARCHAR(200) NOT NULL,
  `task` VARCHAR(200) NOT NULL,
  `args` LONGTEXT NOT NULL,
  `kwargs` LONGTEXT NULL,
  `queue` VARCHAR(200) NULL,
  `exchange` VARCHAR(200) NULL,
  `routing_key` VARCHAR(200) NULL,
  `expires` DATETIME(6) NULL,
  `enabled` INT NOT NULL,
  `last_run_at` DATETIME(6) NULL,
  `total_run_count` INT NOT NULL,
  `date_changed` DATETIME(6) NOT NULL,
  `description` LONGTEXT NULL,
  `crontab_id` BIGINT NULL,
  `interval_id` BIGINT NULL,
  `solar_id` BIGINT NULL,
  `one_off` INT NOT NULL,
  `start_time` DATETIME(6) NULL,
  `priority` INT NULL,
  `headers` LONGTEXT NULL,
  `clocked_id` BIGINT NULL,
  `expire_seconds` INT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `django_celery_beat_periodictasks` (
  `ident` INT NOT NULL,
  `last_update` DATETIME(6) NOT NULL,
  PRIMARY KEY (`ident`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `django_celery_beat_solarschedule` (
  `event` VARCHAR(24) NOT NULL,
  `latitude` DECIMAL(12, 4) NOT NULL,
  `longitude` DECIMAL(12, 4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `django_celery_results_chordcounter` (
  `group_id` VARCHAR(255) NOT NULL,
  `sub_tasks` LONGTEXT NOT NULL,
  `count` INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `django_celery_results_groupresult` (
  `group_id` VARCHAR(255) NOT NULL,
  `date_created` DATETIME(6) NOT NULL,
  `date_done` DATETIME(6) NOT NULL,
  `content_type` VARCHAR(128) NOT NULL,
  `content_encoding` VARCHAR(64) NOT NULL,
  `result` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `django_celery_results_taskresult` (
  `task_id` VARCHAR(255) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `content_type` VARCHAR(128) NOT NULL,
  `content_encoding` VARCHAR(64) NOT NULL,
  `result` LONGTEXT NULL,
  `date_done` DATETIME(6) NOT NULL,
  `traceback` LONGTEXT NULL,
  `meta` LONGTEXT NULL,
  `task_args` LONGTEXT NULL,
  `task_kwargs` LONGTEXT NULL,
  `task_name` VARCHAR(255) NULL,
  `worker` VARCHAR(100) NULL,
  `date_created` DATETIME(6) NOT NULL,
  `periodic_task_name` VARCHAR(255) NULL,
  `date_started` DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `django_content_type` (
  `app_label` VARCHAR(100) NOT NULL,
  `model` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `django_migrations` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `app` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `applied` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `django_session` (
  `session_key` VARCHAR(40) NOT NULL,
  `session_data` LONGTEXT NOT NULL,
  `expire_date` DATETIME(6) NOT NULL,
  PRIMARY KEY (`session_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `django_site` (
  `domain` VARCHAR(100) NOT NULL,
  `name` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mailer_dontsendentry` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `to_address` VARCHAR(254) NOT NULL,
  `when_added` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mailer_message` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `message_data` LONGTEXT NOT NULL,
  `when_added` DATETIME(6) NOT NULL,
  `priority` VARCHAR(255) NOT NULL,
  `retry_count` INT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mailer_messagelog` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `message_data` LONGTEXT NULL,
  `when_added` DATETIME(6) NOT NULL,
  `priority` VARCHAR(255) NOT NULL,
  `when_attempted` DATETIME(6) NOT NULL,
  `result` VARCHAR(1) NOT NULL,
  `log_message` LONGTEXT NOT NULL,
  `message_id` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `socialaccount_socialaccount` (
  `provider` VARCHAR(200) NOT NULL,
  `uid` VARCHAR(191) NOT NULL,
  `last_login` DATETIME(6) NOT NULL,
  `date_joined` DATETIME(6) NOT NULL,
  `extra_data` JSON NOT NULL,
  `user_id` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `socialaccount_socialapp` (
  `provider` VARCHAR(30) NOT NULL,
  `name` VARCHAR(40) NOT NULL,
  `client_id` VARCHAR(191) NOT NULL,
  `secret` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `provider_id` VARCHAR(200) NOT NULL,
  `settings` JSON NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `socialaccount_socialapp_sites` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `socialapp_id` BIGINT NOT NULL,
  `site_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `socialaccount_socialtoken` (
  `token` LONGTEXT NOT NULL,
  `token_secret` LONGTEXT NOT NULL,
  `expires_at` DATETIME(6) NULL,
  `account_id` BIGINT NOT NULL,
  `app_id` BIGINT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;