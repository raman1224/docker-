ar = [2, 7 , 5, 4 ]
tar = 9


for i in range(len(ar)):
    for j in range(i+1, len(ar)):
        # if(ar[i] + ar[j] == tar):
        #     print(ar[i], ar[j])
        if(ar[i] + ar[j] > tar): i+1
        elif(ar[i] + ar[j] < tar): j+1
        elif(ar[i] + ar[j] == tar):
            print(ar[i], ar[j])