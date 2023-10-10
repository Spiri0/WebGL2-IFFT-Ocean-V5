Version 1.0.0 of my multithreading Quadtree Ocean.
Credits to SimonDev, his tutorials helped me a lot to structure large projects cleanly
Credits to Phil Crowther, he inspired me to this project and gave me important impulses

There is still an ugly error in the FixEdgesAndSkirts shader module that I still have to fix. With a quadtree resolution of 24, 36 or 48, or a multiple of that, everything is fine. With other values ​​something slips in the vertex correction calculation. But be careful with big values! The purpose is to keep the value small and in my opinion 24 and 36 are good enough. My main focus will now be on the IFFT.

I have also broken down the shaders into smaller parts so that it is clearer. This makes it much easier to maintain, change and develop highly complex shaders. The reason why I don't save the individual shader parts as glsl but as js is because otherwise I would have to load the shader parts with await fetch 😬, which would be less elegant in a module. Await is a very good modern javascript function that I like to use but only in side threads or when initializing the main thread. Shader parts with export statement allow using import which is very elegant.

Use wasd and arrow keys to navigate
