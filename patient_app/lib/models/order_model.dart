class Order {
  final String id;
  final String orderNumber;
  final String pharmacyName;
  final String? riderName;
  final double totalAmount;
  final String status;
  final String paymentMethod;
  final DateTime createdAt;
  final DateTime? estimatedDeliveryTime;
  final List<OrderItem> items;
  final RiderInfo? rider;

  Order({
    required this.id,
    required this.orderNumber,
    required this.pharmacyName,
    this.riderName,
    required this.totalAmount,
    required this.status,
    required this.paymentMethod,
    required this.createdAt,
    this.estimatedDeliveryTime,
    required this.items,
    this.rider,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] ?? '',
      orderNumber: json['orderNumber'] ?? '',
      pharmacyName: json['pharmacyName'] ?? 'Unknown Pharmacy',
      riderName: json['riderName'],
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      status: json['status'] ?? 'pending',
      paymentMethod: json['paymentMethod'] ?? 'cash',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      estimatedDeliveryTime: json['estimatedDeliveryTime'] != null
          ? DateTime.parse(json['estimatedDeliveryTime'])
          : null,
      items: (json['items'] as List?)
              ?.map((item) => OrderItem.fromJson(item))
              .toList() ??
          [],
      rider: json['rider'] != null ? RiderInfo.fromJson(json['rider']) : null,
    );
  }
}

class RiderInfo {
  final String id;
  final String name;
  final String phone;
  final String? vehicleNumber;

  RiderInfo({
    required this.id,
    required this.name,
    required this.phone,
    this.vehicleNumber,
  });

  factory RiderInfo.fromJson(Map<String, dynamic> json) {
    return RiderInfo(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      vehicleNumber: json['vehicleNumber'],
    );
  }
}

class OrderItem {
  final String medicineName;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  OrderItem({
    required this.medicineName,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      medicineName: json['medicineName'] ?? '',
      quantity: json['quantity'] ?? 1,
      unitPrice: (json['unitPrice'] ?? 0).toDouble(),
      totalPrice: (json['totalPrice'] ?? 0).toDouble(),
    );
  }
}
