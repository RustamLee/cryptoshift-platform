package com.example.demo.sellerrequest.repository;

import com.example.demo.sellerrequest.model.SellerRequest;
import com.example.demo.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerRequestRepository extends JpaRepository<SellerRequest, Long> {
    List<SellerRequest> findByStatus(SellerRequest.RequestStatus status);
    Optional<SellerRequest> findByUser(User user);
    List<SellerRequest> findByUserOrderByCreatedDateDesc(User user);
}
