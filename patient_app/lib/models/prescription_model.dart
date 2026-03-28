class Prescription {
  final String id;
  final String imageUrl;
  final String status;
  final String address;
  final List<double> coordinates;
  final int nearbyPharmaciesCount;
  final DateTime createdAt;
  final DateTime? expiresAt;

  Prescription({
    required this.id,
    required this.imageUrl,
    required this.status,
    required this.address,
    required this.coordinates,
    required this.nearbyPharmaciesCount,
    required this.createdAt,
    this.expiresAt,
  });

  factory Prescription.fromJson(Map<String, dynamic> json) {
    return Prescription(
      id: json['id'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      status: json['status'] ?? 'pending',
      address: json['deliveryAddress']?['address'] ?? json['address'] ?? '',
      coordinates: json['deliveryAddress']?['location']?['coordinates'] != null
          ? List<double>.from(json['deliveryAddress']['location']['coordinates'])
          : json['coordinates'] != null
              ? List<double>.from(json['coordinates'])
              : [0.0, 0.0],
      nearbyPharmaciesCount: json['nearbyPharmaciesCount'] ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'imageUrl': imageUrl,
      'status': status,
      'address': address,
      'coordinates': coordinates,
      'nearbyPharmaciesCount': nearbyPharmaciesCount,
      'createdAt': createdAt.toIso8601String(),
      'expiresAt': expiresAt?.toIso8601String(),
    };
  }
}
