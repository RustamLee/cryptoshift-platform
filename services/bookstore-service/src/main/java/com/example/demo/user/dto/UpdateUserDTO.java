package com.example.demo.user.dto;
import jakarta.validation.constraints.Size;
import java.util.Objects;

public class UpdateUserDTO {

    @Size(min = 3, max = 255, message = "El nombre de usuario debe tener entre 3 y 255 caracteres")
    private String name;
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;
    @Size(min = 8, message = "La contraseña actual debe tener al menos 8 caracteres")
    private String currentPassword;

    public UpdateUserDTO(String name, String password, String currentPassword) {
        this.name = name;
        this.password = password;
        this.currentPassword = currentPassword;
    }


    public UpdateUserDTO() {
    }

    public @Size(min = 3, max = 255, message = "El nombre de usuario debe tener entre 3 y 255 caracteres") String getName() {
        return name;
    }

    public void setName(@Size(min = 3, max = 255, message = "El nombre de usuario debe tener entre 3 y 255 caracteres") String name) {
        this.name = name;
    }

    public @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres") String getPassword() {
        return password;
    }

    public void setPassword(@Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres") String password) {
        this.password = password;
    }

    public @Size(min = 8, message = "La contraseña actual debe tener al menos 8 caracteres") String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(@Size(min = 8, message = "La contraseña actual debe tener al menos 8 caracteres") String currentPassword) {
        this.currentPassword = currentPassword;
    }

    

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UpdateUserDTO that = (UpdateUserDTO) o;
        return Objects.equals(name, that.name) && Objects.equals(password, that.password);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, password, currentPassword);
    }

    @Override
    public String toString() {
    return "UpdateUserDTO{" +
        "name='" + name + '\'' +
        ", password='" + password + '\'' +
        ", currentPassword='" + currentPassword + '\'' +
        '}';
    }
}
