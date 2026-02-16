package com.envisionad.webservice.payment.dataaccesslayer;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminDashboardRepositoryImplTest {

    @Test
    void sumPlatformRevenue_whenBigDecimal_returnsSame() throws Exception {
        EntityManager em = mock(EntityManager.class);
        Query q = mock(Query.class);

        when(em.createNativeQuery(anyString())).thenReturn(q);
        when(q.getSingleResult()).thenReturn(new BigDecimal("99.99"));

        AdminDashboardRepositoryImpl repo = new AdminDashboardRepositoryImpl();
        injectEntityManager(repo, em);

        BigDecimal res = repo.sumPlatformRevenue();

        assertEquals(new BigDecimal("99.99"), res);
    }

    @Test
    void sumPlatformRevenue_whenNotBigDecimal_convertsToBigDecimal() throws Exception {
        EntityManager em = mock(EntityManager.class);
        Query q = mock(Query.class);

        when(em.createNativeQuery(anyString())).thenReturn(q);
        when(q.getSingleResult()).thenReturn(123L);

        AdminDashboardRepositoryImpl repo = new AdminDashboardRepositoryImpl();
        injectEntityManager(repo, em);

        BigDecimal res = repo.sumPlatformRevenue();

        assertEquals(new BigDecimal("123"), res);
    }

    @Test
    void countOrganizations_returnsLongValue() throws Exception {
        EntityManager em = mock(EntityManager.class);
        Query q = mock(Query.class);

        when(em.createNativeQuery(anyString())).thenReturn(q);
        when(q.getSingleResult()).thenReturn(7);

        AdminDashboardRepositoryImpl repo = new AdminDashboardRepositoryImpl();
        injectEntityManager(repo, em);

        assertEquals(7L, repo.countOrganizations());
    }

    private static void injectEntityManager(AdminDashboardRepositoryImpl repo, EntityManager em) throws Exception {
        Field f = AdminDashboardRepositoryImpl.class.getDeclaredField("em");
        f.setAccessible(true);
        f.set(repo, em);
    }
}
