package com.example.demo.user.dto;

import java.util.Objects;
import java.util.Set;
import com.example.demo.sellerprofile.dto.SellerProfileDTOFull;

public class UserDTO {

    private Long id;
    private String name;
    private Set<String> roles;
    private SellerProfileDTOFull sellerProfile;
    private String status;
    private Boolean isTemporaryPassword;

    public UserDTO(Long id, String name, Set<String> roles) {
        this.id = id;
        this.name = name;
        this.roles = roles;
    }

    public UserDTO(Long id, String name, Set<String> roles, String status, Boolean isTemporaryPassword) {
        this.id = id;
        this.name = name;
        this.roles = roles;
        this.status = status;
        this.isTemporaryPassword = isTemporaryPassword;
    }

    public SellerProfileDTOFull getSellerProfile() {
        return sellerProfile;
    }

    public void setSellerProfile(SellerProfileDTOFull sellerProfile) {
        this.sellerProfile = sellerProfile;
    }

    

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsTemporaryPassword() {
        return isTemporaryPassword;
    }

    public void setIsTemporaryPassword(Boolean isTemporaryPassword) {
        this.isTemporaryPassword = isTemporaryPassword;
    }

    public UserDTO(String name, Set<String> roles) {
        this.name = name;
        this.roles = roles;
    }

    public UserDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDTO userDTO = (UserDTO) o;
        return Objects.equals(name, userDTO.name) && Objects.equals(roles, userDTO.roles);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, roles);
    }

    @Override
    public String toString() {
        return "UserDTO{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", roles=" + roles +
                '}';
    }
}
