package com.envisionad.webservice.proofofdisplay.exceptions;

public class AdvertiserEmailNotFoundException extends RuntimeException {
  public AdvertiserEmailNotFoundException(String businessId) {
    super("No advertiser email found for business: " + businessId);
  }
}
