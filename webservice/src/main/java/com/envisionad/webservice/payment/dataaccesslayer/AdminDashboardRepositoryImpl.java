package com.envisionad.webservice.payment.dataaccesslayer;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public class AdminDashboardRepositoryImpl implements AdminDashboardRepository {

    @PersistenceContext
    private EntityManager em;

    @Override
    public long countOrganizations() {
        return ((Number) em.createNativeQuery("SELECT COUNT(*) FROM business").getSingleResult()).longValue();
    }

    @Override
    public long countMediaListings() {
        return ((Number) em.createNativeQuery("""
            SELECT COUNT(*)
            FROM media
            WHERE status = 'ACTIVE'
            """).getSingleResult()).longValue();
    }


    @Override
    public BigDecimal sumPlatformRevenue() {
        Object result = em.createNativeQuery("""
                SELECT COALESCE(SUM(total_price), 0)
                FROM reservations
                WHERE status = 'CONFIRMED'
                """).getSingleResult();
        return (result instanceof BigDecimal bd) ? bd : new BigDecimal(result.toString());
    }

    @Override
    public long countDistinctKnownUsers() {
        return ((Number) em.createNativeQuery("""
                SELECT COUNT(DISTINCT user_id) FROM (
                    SELECT owner_id AS user_id FROM business
                    UNION
                    SELECT user_id AS user_id FROM employee
                    UNION
                    SELECT advertiser_id AS user_id FROM reservations
                ) u
                """).getSingleResult()).longValue();
    }

    @Override
    public long countMediaOwners() {
        return ((Number) em.createNativeQuery("""
                SELECT COUNT(DISTINCT owner_id)
                FROM business
                WHERE media_owner = true
                """).getSingleResult()).longValue();
    }

    @Override
    public long countAdvertisers() {
        return ((Number) em.createNativeQuery("""
                SELECT COUNT(DISTINCT advertiser_id)
                FROM reservations
                """).getSingleResult()).longValue();
    }
}
