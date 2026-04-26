package com.cryptoshift.orchestrator.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateProvider {

    private final StringRedisTemplate redisTemplate;

    public BigDecimal getBitcoinRate() {
        String rate = redisTemplate.opsForValue().get("rate:btc_usdt");
        if (rate == null) {
            log.warn("Bitcoin rate not found in Redis, defaulting to 0");
            throw new IllegalArgumentException("Exchange rate not available");
        }
        return new BigDecimal(rate);
    }

}
