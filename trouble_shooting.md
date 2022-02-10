# Wika Network ETL trouble shooting

If you experience one or more of the processes exiting, you may need to increase you docker resources.

For example, in docker desktop you might see this:


<img src="./assets/img/exited_example.png" width="300">

If that is the case, you might not be alocating enough resources to your docker image. 

To change this in docker desktop, navigate to the settings icon and the click resrouces. There you will see a menu that looks like below image. Increase the CPU and Memory until your image runs without exiting. The below settings were sufficient in testing on a macbook air m1.

<img src="./assets/img/docker_resources.png" width="500">


