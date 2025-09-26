resource "aws_s3_bucket" "frontend_bucket" {
    bucket = "stackit-frontend"

    tags = {
        Name = "StackIt Frontend"
        Project = "StackIt"
    }
}

