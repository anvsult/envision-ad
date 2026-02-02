package com.envisionad.webservice.reservation.dataaccesslayer;

public enum ReservationStatus {
    PENDING, //pending media owner approval
    APPROVED, //approved by media owner
    DENIED, //denied by media owner
    CONFIRMED, //paid by the advertiser
    CANCELLED, //TODO will be removed and instead will allow to try paying again
}
