resource "aws_s3_bucket" "frontend_bucket" {
    bucket = var.bucket_name

    tags = {
        Name = "StackIt Frontend"
        Project = "StackIt"
    }
}

