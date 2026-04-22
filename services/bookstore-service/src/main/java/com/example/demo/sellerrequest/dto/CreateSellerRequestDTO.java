package com.example.demo.sellerrequest.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateSellerRequestDTO {

    @NotBlank(message = "Business name is required")
    private String businessName;

    @NotBlank(message = "CUIT is required")
    private String cuit;

    @NotBlank(message = "Address is required")
    private String address;

    public CreateSellerRequestDTO() {
    }

    public CreateSellerRequestDTO(String businessName, String cuit, String address) {
        this.businessName = businessName;
        this.cuit = cuit;
        this.address = address;
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
}
