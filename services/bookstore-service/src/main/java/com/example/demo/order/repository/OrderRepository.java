package com.example.demo.order.repository;

import com.example.demo.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order,Long> {
	boolean existsByUser_Id(Long userId);

	boolean existsByBooks_Seller_Id(Long sellerId);

    List<Order> findAllByUserId(Long userId);

}
