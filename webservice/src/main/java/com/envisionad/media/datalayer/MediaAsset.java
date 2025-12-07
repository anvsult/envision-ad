package com.envisionad.media.datalayer;


@Data
@Entity

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public class MediaAsset{

    private String title;
    private int estimatedDailyViews;
    private double pricePerWeek;
    private double width;
    private double width;
    private URL image;
    private double[4] mediaCorners;
}