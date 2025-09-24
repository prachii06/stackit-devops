resource "aws_s3_bucket" "frontend_bucket" {
    bucket = "stackIt-frontend-xyz-898998"

    tags = {
        Name = "StackIt Frontend"
        Project = "StackIt"
    }
}