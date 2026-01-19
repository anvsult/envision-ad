package com.envisionad.webservice.media.exceptions;

import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "Media not found")
public class MediaNotFoundException extends RuntimeException {
    public MediaNotFoundException(String mediaId) {
        super("Media with ID " + mediaId + " not found.");
    }
}
