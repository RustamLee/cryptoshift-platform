package org.example.exchangerate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.exchangerate.client.BinanceClient;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class RateUpdater {

    private final BinanceClient binanceClient;
    private final StringRedisTemplate redisTemplate;

    @Scheduled(fixedRateString = "${app.rate-update-interval}")
    public void updateBtcRate() {
        try {
            BigDecimal price = binanceClient.fetchLatestPrice();

            redisTemplate.opsForValue().set("rate:btc_usdt", price.toString());

            log.info(">>> Bitcoin rate was updated in Redis : {} USDT", price);
        } catch (Exception e) {
            log.error("!!! Error in updating the Bitcoin rate : {}", e.getMessage());
        }
    }
}