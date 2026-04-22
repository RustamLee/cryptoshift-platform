package com.example.demo.user.dto;

public class AdminUpdateUserDTO {
    private String name;
    private String password;
    private Boolean isTemporaryPassword;
    private String status; 

    public AdminUpdateUserDTO() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getIsTemporaryPassword() {
        return isTemporaryPassword;
    }

    public void setIsTemporaryPassword(Boolean isTemporaryPassword) {
        this.isTemporaryPassword = isTemporaryPassword;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
