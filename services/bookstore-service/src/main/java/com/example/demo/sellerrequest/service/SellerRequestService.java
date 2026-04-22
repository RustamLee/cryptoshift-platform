package com.example.demo.sellerrequest.service;

import com.example.demo.sellerrequest.dto.CreateSellerRequestDTO;
import com.example.demo.sellerrequest.dto.SellerRequestDTO;
import com.example.demo.sellerrequest.model.SellerRequest;
import com.example.demo.sellerrequest.repository.SellerRequestRepository;
import com.example.demo.user.model.User;
import com.example.demo.user.service.UserServiceImpl;
import com.example.demo.sellerprofile.model.SellerProfile;
import com.example.demo.sellerprofile.repository.SellerProfileRepository;
import org.springframework.stereotype.Service;
import com.example.demo.exceptions.NotFoundException;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SellerRequestService {

    private final SellerRequestRepository repository;
    private final UserServiceImpl userService;
    private final SellerProfileRepository sellerProfileRepository;

    public SellerRequestService(SellerRequestRepository repository, UserServiceImpl userService, SellerProfileRepository sellerProfileRepository) {
        this.repository = repository;
        this.userService = userService;
        this.sellerProfileRepository = sellerProfileRepository;
    }

    public SellerRequestDTO createRequest(CreateSellerRequestDTO dto) {
        User currentUser;
        try {
            currentUser = userService.getCurrentUser();
        } catch (NotFoundException e) {
            throw new RuntimeException("Current user not found: " + e.getMessage());
        }
        
        Optional<SellerRequest> existingRequest = repository.findByUser(currentUser);
        if (existingRequest.isPresent() && existingRequest.get().getStatus() == SellerRequest.RequestStatus.PENDING) {
            throw new RuntimeException("You already have a pending seller request");
        }

        SellerRequest request = new SellerRequest(currentUser, dto.getBusinessName(), dto.getCuit(), dto.getAddress());
        SellerRequest saved = repository.save(request);
        return new SellerRequestDTO(saved);
    }

    public List<SellerRequestDTO> getAllRequests() {
        return repository.findAll().stream()
                .map(SellerRequestDTO::new)
                .collect(Collectors.toList());
    }

    public List<SellerRequestDTO> getPendingRequests() {
        return repository.findByStatus(SellerRequest.RequestStatus.PENDING).stream()
                .map(SellerRequestDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<SellerRequestDTO> getRequestById(Long id) {
        return repository.findById(id)
                .map(SellerRequestDTO::new);
    }

    public Optional<SellerRequestDTO> getCurrentUserRequest() {
        User currentUser;
        try {
            currentUser = userService.getCurrentUser();
        } catch (NotFoundException e) {
            throw new RuntimeException("Current user not found: " + e.getMessage());
        }
        return repository.findByUserOrderByCreatedDateDesc(currentUser)
                .stream()
                .findFirst()
                .map(SellerRequestDTO::new);
    }

    public SellerRequestDTO approveRequest(Long id) {
        SellerRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User user = request.getUser();
        if (user != null) {
            boolean changed = false;
            if (user.getSellerProfile() == null) {
                SellerProfile newSeller = new SellerProfile(request.getBusinessName(), request.getAddress(), request.getCuit(), user);
                SellerProfile savedSeller = sellerProfileRepository.save(newSeller);
                user.setSellerProfile(savedSeller);
                changed = true;
            }
            if (!user.getRoles().contains("ROLE_SELLER")) {
                user.getRoles().add("ROLE_SELLER");
                changed = true;
            }
            if (changed) {
                try {
                    userService.saveCurrentUser(user);
                } catch (Exception e) {
                    System.err.println("Failed to persist user changes when approving seller request: " + e.getMessage());
                }
            }
        }

        request.setStatus(SellerRequest.RequestStatus.APPROVED);
        request.setUpdatedDate(Date.valueOf(LocalDate.now()));
        request.setRejectionReason(null);

        SellerRequest saved = repository.save(request);
        return new SellerRequestDTO(saved);
    }

    public SellerRequestDTO rejectRequest(Long id, String reason) {
        SellerRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(SellerRequest.RequestStatus.REJECTED);
        request.setUpdatedDate(Date.valueOf(LocalDate.now()));
        request.setRejectionReason(reason);
        
        SellerRequest saved = repository.save(request);
        return new SellerRequestDTO(saved);
    }

    public void withdrawRequest(Long id) {
        SellerRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        User currentUser;
        try {
            currentUser = userService.getCurrentUser();
        } catch (NotFoundException e) {
            throw new RuntimeException("Current user not found: " + e.getMessage());
        }
        if (!request.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only withdraw your own requests");
        }

        if (request.getStatus() != SellerRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be withdrawn");
        }

        repository.deleteById(id);
    }
}
