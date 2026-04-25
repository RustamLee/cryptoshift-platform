package org.example.exchangerate.client;

import org.example.exchangerate.dto.BinancePriceResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;

@Component
public class BinanceClient {

    private final WebClient webClient;

    public BinanceClient(WebClient.Builder webClientBuilder,
                         @Value("${binance.api.url}") String apiUrl) {
        this.webClient = webClientBuilder.baseUrl(apiUrl).build();
    }

    public BigDecimal fetchLatestPrice() {
        return webClient.get()
                .retrieve()
                .bodyToMono(BinancePriceResponse.class)
                .map(BinancePriceResponse::getPrice)
                .block();
    }
}

