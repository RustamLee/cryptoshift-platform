package com.example.demo.sellerprofile.dto;

import com.example.demo.user.model.User;
import jakarta.validation.constraints.*;
import java.util.Objects;

public class UpdateSellerProfileDTO {

    @Size(min = 6, max = 255, message = "The seller name must have between 6 and 255 characters")
    private String name;
    @Size(min = 6, max = 128, message = "The address must have between 6 and 128 characters")
    private String address;
    @Pattern(regexp = "^\\d{2}-\\d{8}-\\d{1}$", message = "AFIP number must be in format XX-XXXXXXXX-X")
    private String afipNumber;
    private User sellerUser;

    public UpdateSellerProfileDTO(String name, String address, String afipNumber, User sellerUser) {
        this.name = name;
        this.address = address;
        this.afipNumber = afipNumber;
        this.sellerUser = sellerUser;
    }

    public UpdateSellerProfileDTO() {
    }

    public @Size(min = 6, max = 255, message = "The seller name must have between 6 and 255 characters") String getName() {
        return name;
    }

    public void setName(@Size(min = 6, max = 255, message = "The seller name must have between 6 and 255 characters") String name) {
        this.name = name;
    }

    public @Size(min = 6, max = 128, message = "The address must have between 6 and 128 characters") String getAddress() {
        return address;
    }

    public void setAddress( @Size(min = 6, max = 128, message = "The address must have between 6 and 128 characters") String address) {
        this.address = address;
    }

    public @Pattern(regexp = "^\\d{2}-\\d{8}-\\d{1}$", message = "AFIP number must be in format XX-XXXXXXXX-X") String getAfipNumber() {
        return afipNumber;
    }

    public void setAfipNumber(@Pattern(regexp = "^\\d{2}-\\d{8}-\\d{1}$", message = "AFIP number must be in format XX-XXXXXXXX-X") String afipNumber) {
        this.afipNumber = afipNumber;
    }

    public User getSellerUser() {
        return sellerUser;
    }

    public void setSellerUser(User sellerUser) {
        this.sellerUser = sellerUser;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UpdateSellerProfileDTO that = (UpdateSellerProfileDTO) o;
        return Objects.equals(name, that.name) && Objects.equals(address, that.address) && Objects.equals(afipNumber, that.afipNumber) && Objects.equals(sellerUser, that.sellerUser);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, address, afipNumber, sellerUser);
    }

    @Override
    public String toString() {
        return "UpdateSellerProfileDTO{" +
                "name='" + name + '\'' +
                ", address='" + address + '\'' +
                ", afipNumber='" + afipNumber + '\'' +
                ", sellerUser=" + sellerUser +
                '}';
    }
}
