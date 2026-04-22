package com.example.demo.genre.dto;


import java.util.Objects;

public class UpdateGenreDTO {

    private String name;
    private String description;

    public UpdateGenreDTO(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public UpdateGenreDTO() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UpdateGenreDTO that = (UpdateGenreDTO) o;
        return Objects.equals(name, that.name) && Objects.equals(description, that.description);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, description);
    }

    @Override
    public String toString() {
        return "UpdateGenreDTO{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
