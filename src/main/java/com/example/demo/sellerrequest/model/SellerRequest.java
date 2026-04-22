package com.example.demo.sellerrequest.model;

import com.example.demo.user.model.User;
import jakarta.persistence.*;
import java.sql.Date;
import java.time.LocalDate;

@Entity
@Table(name = "seller_requests")
public class SellerRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String businessName;

    @Column(nullable = false)
    private String cuit;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;

    @Column
    private String rejectionReason;

    @Column(nullable = false)
    private Date createdDate;

    @Column
    private Date updatedDate;

    public enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    public SellerRequest() {
    }

    public SellerRequest(User user, String businessName, String cuit, String address) {
        this.user = user;
        this.businessName = businessName;
        this.cuit = cuit;
        this.address = address;
        this.status = RequestStatus.PENDING;
        this.createdDate = Date.valueOf(LocalDate.now());
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getCuit() {
        return cuit;
    }

    public void setCuit(String cuit) {
        this.cuit = cuit;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    public Date getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(Date updatedDate) {
        this.updatedDate = updatedDate;
    }
}
