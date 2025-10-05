class Product {
  final int id;
  final int orderId;
  final String name;
  final int quantity;
  final double weight;
  final String imgUrl;

  Product({
    required this.id,
    required this.orderId,
    required this.name,
    required this.quantity,
    required this.weight,
    required this.imgUrl,
  });

  /// Tạo đối tượng Product từ JSON
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      orderId: json['order_id'],
      name: json['name'],
      quantity: json['quantity'],
      weight: (json['weight'] as num).toDouble(),
      imgUrl: json['img_url'],
    );
  }

  /// Chuyển Product sang JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'order_id': orderId,
      'name': name,
      'quantity': quantity,
      'weight': weight,
      'img_url': imgUrl,
    };
  }
}
