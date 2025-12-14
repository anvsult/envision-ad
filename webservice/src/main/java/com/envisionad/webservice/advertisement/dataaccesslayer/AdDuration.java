package com.envisionad.webservice.advertisement.dataaccesslayer;

import com.envisionad.webservice.advertisement.exceptions.UnsupportedAdDurationException;

public enum AdDuration {
    S10(10),
    S15(15),
    S30(30);

    private final int seconds;

    AdDuration(int seconds) {
        this.seconds = seconds;
    }

    public int getSeconds() {
        return seconds;
    }

    public static AdDuration fromSeconds(Integer seconds) {
        if (seconds == null) return null;
        return switch (seconds) {
            case 10 -> S10;
            case 15 -> S15;
            case 30 -> S30;
            default -> throw new UnsupportedAdDurationException(seconds);
        };
    }
}
