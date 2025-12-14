package com.envisionad.webservice.advertisement.businesslogiclayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.Ad;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdRepository;
import com.envisionad.webservice.advertisement.datamapperlayer.AdResponseMapper;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdResponseModel;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdServiceImpl implements AdService {
    private final AdRepository adRepository;
    private final AdResponseMapper adResponseMapper;

    public AdServiceImpl(AdRepository adRepository, AdResponseMapper adResponseMapper) {
        this.adRepository = adRepository;
        this.adResponseMapper = adResponseMapper;
    }

    @Override
    public List<AdResponseModel> getAllAds() {
        List<Ad> ads = adRepository.findAll();
        return adResponseMapper.entitiesToResponseModelList(ads);
    }

}
