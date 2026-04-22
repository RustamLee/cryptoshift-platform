package com.example.demo.author.dto;
import jakarta.validation.constraints.*;
import java.sql.Date;
import java.util.Objects;

public class CreateAuthorDTO {

    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(min = 3, max = 255, message = "El nombre debe tener entre 3 y 255 caracteres")
    private String name;

    @NotNull(message = "Se requiere una fecha de nacimiento")
    private Date birthDate;

    public CreateAuthorDTO(String name, Date birthDate) {
        this.name = name;
        this.birthDate = birthDate;
    }

    public CreateAuthorDTO() {
    }

    public @NotBlank(message = "El nombre no puede estar vacío") @Size(min = 3, max = 255, message = "El nombre debe tener entre 3 y 255 caracteres") String getName() {
        return name;
    }

    public void setName(@NotBlank(message = "El nombre no puede estar vacío") @Size(min = 3, max = 255, message = "El nombre debe tener entre 3 y 255 caracteres") String name) {
        this.name = name;
    }

    public @NotNull(message = "Se requiere una fecha de nacimiento") Date getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(@NotNull(message = "Se requiere una fecha de nacimiento") Date birthDate) {
        this.birthDate = birthDate;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CreateAuthorDTO that = (CreateAuthorDTO) o;
        return Objects.equals(name, that.name) && Objects.equals(birthDate, that.birthDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, birthDate);
    }

    @Override
    public String toString() {
        return "CreateAuthorDTO{" +
                "name='" + name + '\'' +
                ", birthDate=" + birthDate +
                '}';
    }
}
