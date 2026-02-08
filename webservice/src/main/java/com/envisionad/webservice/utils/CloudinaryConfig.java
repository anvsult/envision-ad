package com.envisionad.webservice.utils;

import com.cloudinary.Cloudinary;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Configuration
public class CloudinaryConfig {

    @Value("${CLOUDINARY_URL:}")
    private String cloudinaryUrl;

    @Bean
    public Cloudinary cloudinary() {
        if (cloudinaryUrl == null || cloudinaryUrl.isBlank()) {
            return new Cloudinary();
        }
        return new Cloudinary(cloudinaryUrl.trim());
    }

    public static String getResourceTypeFromUrl(String url) {
        if (url == null || url.isBlank()) return "image";

        if (url.contains("/video/")) return "video";
        if (url.contains("/raw/")) return "raw";

        return "image";
    }

     // Helper method to extract Public ID from a Cloudinary URL
     public static String getPublicIdFromUrl(String url) {
         if (url == null || url.isBlank()) return null;

         try {
             // This regex splits at /upload/, then skips:
             // - Any transformation segments (ex: a cropped image will change the URL to c_fill,w_400/)
             // - The version segment (ex: v157121/)
             // And gets the rest as the Public ID
             String regex = "/upload/(?:[a-zA-Z0-9_,=]+/)*(?:v\\d+/)?(.+?)(?:\\.[a-z0-9]+)?$";
             Pattern pattern = Pattern.compile(regex);
             Matcher matcher = pattern.matcher(url);

             if (matcher.find()) {
                 return matcher.group(1);
             }
         } catch (Exception e) {
             return null;
         }
         return null;
     }
}