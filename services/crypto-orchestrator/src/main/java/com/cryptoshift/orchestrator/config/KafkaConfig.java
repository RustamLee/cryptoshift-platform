package com.cryptoshift.orchestrator.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.support.converter.JsonMessageConverter;
import org.springframework.kafka.support.converter.RecordMessageConverter;

@Configuration
public class KafkaConfig {

    @Bean
    public RecordMessageConverter converter() {
        // Этот бин говорит Спрингу: "Если видишь JSON — конвертируй в объект сам"
        return new JsonMessageConverter();
    }
}