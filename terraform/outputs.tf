output "s3_bucket_id" {
  description = "The final name of the created S3 bucket."
  value       = aws_s3_bucket.frontend_bucket.id
}