package com.example.urlshortener.controller;

import com.example.urlshortener.dto.ShortUrlRequest;
import com.example.urlshortener.model.UrlMapping;
import com.example.urlshortener.repository.UrlRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.net.URI;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
public class UrlShortenerController {

    @Autowired
    private UrlRepository urlRepository;

    private final String BASE_URL = "http://localhost:8080/s/";

    @PostMapping("/api/shorten")
    public Map<String, String> shortenUrl(@RequestBody ShortUrlRequest request) {
        String code = UUID.randomUUID().toString().substring(0, 6);
        String shortUrl = BASE_URL + code;

        UrlMapping mapping = new UrlMapping(request.getLongUrl(), code);
        urlRepository.save(mapping);

        System.out.println("✅ Saved to MongoDB: " + code + " -> " + request.getLongUrl());

        return Map.of("shortUrl", shortUrl);
    }

    @GetMapping("/s/{code}")
    public ResponseEntity<?> redirectToOriginal(@PathVariable String code) {
        System.out.println("🔍 Redirect requested for code: " + code);

        Optional<UrlMapping> optional = urlRepository.findByShortCode(code);

        if (optional.isPresent()) {
            String originalUrl = optional.get().getLongUrl();
            System.out.println("✅ Found in DB! Redirecting to: " + originalUrl);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(originalUrl))
                    .build();
        } else {
            System.out.println("❌ Code not found in DB: " + code);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("⚠️ Short URL not found.");
        }
    }
}
