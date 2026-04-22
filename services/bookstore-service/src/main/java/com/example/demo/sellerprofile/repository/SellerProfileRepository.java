package com.example.demo.sellerprofile.repository;

import com.example.demo.sellerprofile.model.SellerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SellerProfileRepository extends JpaRepository<SellerProfile,Long> {
}
