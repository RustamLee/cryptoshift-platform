package com.example.demo.order.service;

import com.example.demo.exceptions.InsufficientStockException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.exceptions.UnautorizedException;
import com.example.demo.order.dto.CreateOrderDTO;
import com.example.demo.order.dto.OrderDTO;
import com.example.demo.order.dto.UpdateOrderDTO;
import com.example.demo.order.model.Order;
import com.example.demo.order.model.PaymentMethod;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface OrderService {
    Optional<OrderDTO> getById(Long id);
    List<OrderDTO> getAll();
    OrderDTO createOrder(PaymentMethod paymentMethod) throws NotFoundException, InsufficientStockException, UnautorizedException, IOException;
    Optional<OrderDTO> updateOrder (Long id, UpdateOrderDTO updateOrderDTO);
    boolean deleteOrder(Long id);
    void sendOrderEmail(String userEmail, String saleDetails) throws IOException;

    Order convertToEntity(CreateOrderDTO createSaleDTO);
    OrderDTO convertToDTO(Order order);
}
