package com.example.demo.sellerrequest.dto;

import com.example.demo.sellerrequest.model.SellerRequest;
import java.sql.Date;

public class SellerRequestDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String businessName;
    private String cuit;
    private String address;
    private String status;
    private String rejectionReason;
    private Date createdDate;
    private Date updatedDate;

    public SellerRequestDTO() {
    }

    public SellerRequestDTO(SellerRequest request) {
        this.id = request.getId();
        this.userId = request.getUser().getId();
        this.userName = request.getUser().getName();
        this.businessName = request.getBusinessName();
        this.cuit = request.getCuit();
        this.address = request.getAddress();
        this.status = request.getStatus().toString();
        this.rejectionReason = request.getRejectionReason();
        this.createdDate = request.getCreatedDate();
        this.updatedDate = request.getUpdatedDate();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
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
