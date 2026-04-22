package com.example.demo.sellerrequest.controller;

import com.example.demo.sellerrequest.dto.CreateSellerRequestDTO;
import com.example.demo.sellerrequest.dto.SellerRequestDTO;
import com.example.demo.sellerrequest.service.SellerRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/seller-requests")
public class SellerRequestController {

    private final SellerRequestService service;

    public SellerRequestController(SellerRequestService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<SellerRequestDTO> createRequest(@Valid @RequestBody CreateSellerRequestDTO dto) {
        try {
            SellerRequestDTO result = service.createRequest(dto);
            return new ResponseEntity<>(result, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<SellerRequestDTO>> getAllRequests() {
        return ResponseEntity.ok(service.getAllRequests());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<SellerRequestDTO>> getPendingRequests() {
        return ResponseEntity.ok(service.getPendingRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SellerRequestDTO> getRequestById(@PathVariable Long id) {
        Optional<SellerRequestDTO> request = service.getRequestById(id);
        return request.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me/current")
    public ResponseEntity<SellerRequestDTO> getCurrentUserRequest() {
        Optional<SellerRequestDTO> request = service.getCurrentUserRequest();
        return request.map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<SellerRequestDTO> approveRequest(@PathVariable Long id) {
        try {
            SellerRequestDTO result = service.approveRequest(id);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<SellerRequestDTO> rejectRequest(@PathVariable Long id, @RequestBody RejectReasonDTO dto) {
        try {
            SellerRequestDTO result = service.rejectRequest(id, dto.getReason());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}/withdraw")
    public ResponseEntity<Void> withdrawRequest(@PathVariable Long id) {
        try {
            service.withdrawRequest(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    public static class RejectReasonDTO {
        private String reason;

        public RejectReasonDTO() {
        }

        public RejectReasonDTO(String reason) {
            this.reason = reason;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}
