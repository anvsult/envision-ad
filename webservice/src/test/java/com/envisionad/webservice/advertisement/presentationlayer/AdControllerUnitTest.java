package com.envisionad.webservice.advertisement.presentationlayer;

import com.envisionad.webservice.advertisement.dataaccesslayer.Ad;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdCampaign;
import com.envisionad.webservice.advertisement.dataaccesslayer.AdDuration;
import com.envisionad.webservice.advertisement.datamapperlayer.AdCampaignRequestMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdCampaignResponseMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdRequestMapper;
import com.envisionad.webservice.advertisement.datamapperlayer.AdResponseMapper;
import com.envisionad.webservice.advertisement.exceptions.InvalidAdDurationException;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdCampaignRequestModel;
import com.envisionad.webservice.advertisement.presentationlayer.models.AdRequestModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class AdControllerUnitTest {
    private final AdCampaignRequestMapper requestMapper = Mappers.getMapper(AdCampaignRequestMapper.class);
    private final AdCampaignResponseMapper responseMapper = Mappers.getMapper(AdCampaignResponseMapper.class);
    private final AdRequestMapper adRequestMapper = Mappers.getMapper(AdRequestMapper.class);
    private final AdResponseMapper adResponseMapper = Mappers.getMapper(AdResponseMapper.class);

    @BeforeEach
    void setUp() {
        AdResponseMapper childMapper = Mappers.getMapper(AdResponseMapper.class);

        ReflectionTestUtils.setField(responseMapper, "adResponseMapper", childMapper);
    }

    @Test
    void requestModelToEntity_ShouldMapRequestModelToEntity() {
        AdCampaignRequestModel req = new AdCampaignRequestModel();
        req.setName("Summer Sale");
        var entity = requestMapper.requestModelToEntity(req);
        assertEquals("Summer Sale", entity.getName());
    }

    @Test
    void entityToResponseModel_ShouldMapEntityToResponseModel() {
        var entity = new AdCampaign();
        entity.setName("Holiday Campaign");

        var respModel = responseMapper.entityToResponseModel(entity);
        assertEquals("Holiday Campaign", respModel.getName());
    }

    @Test
    void entitiesToResponseModels_ShouldMapEntitiesToResponseModels() {
        var entity1 = new AdCampaign();
        entity1.setName("Campaign 1");
        var entity2 = new AdCampaign();
        entity2.setName("Campaign 2");

        var entities = java.util.List.of(entity1, entity2);
        var respModels = responseMapper.entitiesToResponseModelList(entities);

        assertEquals(2, respModels.size());
        assertEquals("Campaign 1", respModels.get(0).getName());
        assertEquals("Campaign 2", respModels.get(1).getName());
    }

    @Test
    void entityToResponseModel_WhenEntityIsNull_ShouldReturnNull() {
        // Act
        var result = responseMapper.entityToResponseModel(null);

        // Assert
        assertNull(result);
    }

    @Test
    void entitiesToResponseModels_WhenListIsNull_ShouldReturnNull() {
        // Act
        var result = responseMapper.entitiesToResponseModelList(null);

        // Assert
        assertNull(result);
    }

    @Test
    void getSeconds_shouldReturnCorrectSeconds() {
        assertEquals(10, AdDuration.S10.getSeconds());
        assertEquals(15, AdDuration.S15.getSeconds());
        assertEquals(30, AdDuration.S30.getSeconds());
    }

    @Test
    void fromSeconds_shouldReturnEnumForValidValues() {
        assertSame(AdDuration.S10, AdDuration.fromSeconds(10));
        assertSame(AdDuration.S15, AdDuration.fromSeconds(15));
        assertSame(AdDuration.S30, AdDuration.fromSeconds(30));
    }

    @Test
    void fromSeconds_null_shouldReturnNull() {
        assertNull(AdDuration.fromSeconds(null));
    }

    @Test
    void fromSeconds_invalidValue_shouldThrowInvalidAdDurationException() {
        assertThrows(InvalidAdDurationException.class, () -> AdDuration.fromSeconds(7));
        assertThrows(InvalidAdDurationException.class, () -> AdDuration.fromSeconds(-10));
        assertThrows(InvalidAdDurationException.class, () -> AdDuration.fromSeconds(0));
    }


//    ================= NEGATIVE TESTS =================
    @Test
    void requestModelToEntity_WhenModelIsNull_ShouldReturnNull() {
        assertNull(requestMapper.requestModelToEntity(null));
    }

    @Test
    void adRequestMapper_requestModelToEntity_ShouldMapCorrectly() {
        AdRequestModel model = new AdRequestModel();
        model.setName("Test Ad");
        model.setAdDurationSeconds(30);

        Ad entity = adRequestMapper.requestModelToEntity(model);

        assertNotNull(entity);
        assertEquals("Test Ad", entity.getName());
    }

    @Test
    void adRequestMapper_requestModelToEntity_WhenNull_ShouldReturnNull() {
        assertNull(adRequestMapper.requestModelToEntity(null));
    }

    @Test
    void adResponseMapper_entityToResponseModel_WhenNull_ShouldReturnNull() {
        assertNull(adResponseMapper.entityToResponseModel(null));
    }

    @Test
    void adResponseMapper_entityListToResponseList_WhenNull_ShouldReturnNull() {
        assertNull(adResponseMapper.entitiesToResponseModelList(null));
    }
}
