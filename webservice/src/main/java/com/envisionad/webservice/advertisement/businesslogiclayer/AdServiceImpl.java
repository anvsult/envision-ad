package com.envisionad.webservice.advertisement.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.Ad;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdRepository;
import com.envisionad.webservice.advertisement.datamapperlayer.AdModelMapper;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdResponseModel;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdServiceImpl implements AdService {
    private final AdRepository adRepository;
    private final AdModelMapper adModelMapper;

    public AdServiceImpl(AdRepository adRepository, AdModelMapper adModelMapper) {
        this.adRepository = adRepository;
        this.adModelMapper = adModelMapper;
    }

    @Override
    public List<AdResponseModel> getAllAds() {
        List<Ad> ads = adRepository.findAll();
        return adModelMapper.toAdResponseModelList(ads);
    }

}
