package com.example.demo.author.model;

import com.example.demo.book.model.Book;
import jakarta.persistence.*;
import java.sql.Date;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "authors")
public class Author {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private Date birthDate;

    @OneToMany(mappedBy = "author")
    private List<Book> bookslist;

    public Author(Long id, String name, Date birthDate, List<Book> bookslist) {
        this.id = id;
        this.name = name;
        this.birthDate = birthDate;
        this.bookslist = bookslist;
    }

    public Author(String name, Date birthDate) {
        this.name = name;
        this.birthDate = birthDate;
    }

    public Author() {
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

    public Date getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }

    public List<Book> getBookslist() {
        return bookslist;
    }

    public void setBookslist(List<Book> bookslist) {
        this.bookslist = bookslist;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Author author = (Author) o;
        return  Objects.equals(name, author.name) && Objects.equals(birthDate, author.birthDate) ;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, birthDate, bookslist);
    }

    @Override
    public String toString() {
        return "Author{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", birthDate=" + birthDate +
                ", bookslist=" + bookslist +
                '}';
    }
}
