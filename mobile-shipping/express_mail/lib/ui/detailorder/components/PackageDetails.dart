import 'package:express_mail/data/model/ShippingOrder.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';

class PackageDetails extends StatelessWidget {
  final ShippingOrder detailOrder;

  const PackageDetails({super.key, required this.detailOrder});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
      padding: const EdgeInsets.all(25),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gray_DADFE7, width: 1),
        boxShadow: [
          BoxShadow(
            color: AppColors.gray_DADFE7.withValues(alpha: 0.4),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              SvgPicture.asset(
                "assets/images/ic_delivered.svg",
                colorFilter: const ColorFilter.mode(
                  AppColors.blue_127AE2,
                  BlendMode.srcIn,
                ),
                width: 23,
                height: 23,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  AppStrings.package_details,
                  style: const TextStyle(
                    color: AppColors.blue_344256,
                    fontFamily: "Inter_bold",
                    fontSize: 23,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildItem(
            "assets/images/ic_length.svg",
            "${AppStrings.length}: ${detailOrder.length} ${AppStrings.cm}",
          ),
          const SizedBox(height: 10),
          _buildItem(
            "assets/images/ic_width.svg",
            "${AppStrings.width}: ${detailOrder.width} ${AppStrings.cm}",
          ),
          const SizedBox(height: 10),
          _buildItem(
            "assets/images/ic_height.svg",
            "${AppStrings.height}: ${detailOrder.height} ${AppStrings.cm}",
          ),
          const SizedBox(height: 10),
          _buildItem(
            "assets/images/ic_weight.svg",
            "${AppStrings.weight}: ${detailOrder.weight} ${AppStrings.kg}",
          ),
          const SizedBox(height: 10),
          _buildProductList(context),
        ],
      ),
    );
  }

  Widget _buildItem(String icon, String text) {
    return Row(
      children: [
        SvgPicture.asset(
          icon,
          colorFilter: const ColorFilter.mode(
            AppColors.gray_7B899D,
            BlendMode.srcIn,
          ),
          width: 13,
          height: 13,
        ),
        const SizedBox(width: 5),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 13,
              fontFamily: "Inter_regular",
              color: AppColors.gray_7B899D,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildProductList(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            SvgPicture.asset(
              "assets/images/ic_product.svg",
              colorFilter: const ColorFilter.mode(
                AppColors.gray_7B899D,
                BlendMode.srcIn,
              ),
              width: 13,
              height: 13,
            ),
            const SizedBox(width: 5),
            Text(
              "${AppStrings.products} (${detailOrder.products?.length}):",
              style: const TextStyle(
                fontSize: 13,
                fontFamily: "Inter_regular",
                color: AppColors.gray_7B899D,
              ),
            ),
          ],
        ),
        const SizedBox(height: 5),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: detailOrder.products!.map((product) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 3),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        SvgPicture.asset(
                          "assets/images/ic_tick.svg",
                          colorFilter: const ColorFilter.mode(
                            AppColors.green_22C35D,
                            BlendMode.srcIn,
                          ),
                          width: 13,
                          height: 13,
                        ),
                        const SizedBox(width: 5),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              product.name,
                              style: const TextStyle(
                                fontSize: 13,
                                fontFamily: "Inter_regular",
                                color: AppColors.gray_7B899D,
                              ),
                            ),
                            Text(
                              "${AppStrings.weight}: ${product.weight} ${AppStrings.kg}",
                              style: const TextStyle(
                                fontSize: 13,
                                fontFamily: "Inter_regular",
                                color: AppColors.gray_7B899D,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () => _showImageDialog(context, product.imgUrl),
                      child: SvgPicture.asset(
                        "assets/images/ic_picture.svg",
                        width: 30,
                        height: 30,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  void _showImageDialog(BuildContext context, String imageUrl) {
    if (imageUrl.isEmpty) return;

    showDialog(
      context: context,
      barrierDismissible: true,
      barrierColor: Colors.black.withValues(alpha: 0.7),
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(20),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: _ImageWithLoading(url: imageUrl),
          ),
        );
      },
    );
  }
}

class _ImageWithLoading extends StatefulWidget {
  final String url;

  const _ImageWithLoading({required this.url});

  @override
  State<_ImageWithLoading> createState() => _ImageWithLoadingState();
}

class _ImageWithLoadingState extends State<_ImageWithLoading> {
  bool _isLoading = true;
  bool _isError = false;
  ImageStream? _imageStream;
  ImageStreamListener? _listener;

  @override
  void initState() {
    super.initState();
    _loadImage();
  }

  void _loadImage() {
    final ImageProvider provider = NetworkImage(widget.url);
    final ImageStream stream = provider.resolve(const ImageConfiguration());
    _imageStream = stream;

    _listener = ImageStreamListener(
      (ImageInfo imageInfo, bool synchronousCall) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            setState(() => _isLoading = false);
          }
        });
      },
      onError: (dynamic error, StackTrace? stackTrace) {
        if (mounted) {
          setState(() {
            _isError = true;
            _isLoading = false;
          });
        }
      },
    );

    stream.addListener(_listener!);
  }

  @override
  void dispose() {
    if (_listener != null) {
      _imageStream?.removeListener(_listener!);
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        AnimatedOpacity(
          opacity: _isLoading ? 0 : 1,
          duration: const Duration(milliseconds: 400),
          child: InteractiveViewer(
            minScale: 0.8,
            maxScale: 4.0,
            child: !_isError
                ? Image.network(
                    widget.url,
                    fit: BoxFit.contain,
                    loadingBuilder: (context, child, progress) {
                      if (progress == null) return child;
                      return const SizedBox.shrink();
                    },
                  )
                : const Icon(Icons.broken_image, color: Colors.grey, size: 120),
          ),
        ),

        if (_isLoading)
          Center(
            child: SizedBox(
              width: 40,
              height: 40,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                color: AppColors.blue_127AE2,
              ),
            ),
          ),

        if (_isError)
          const Icon(Icons.error_outline, color: Colors.redAccent, size: 40),
      ],
    );
  }
}
