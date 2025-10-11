output "website_url" {
  description = "The final URL of the CloudFront distribution for the application."
  value       = "https://${aws_cloudfront_distribution.main_distribution.domain_name}"
}